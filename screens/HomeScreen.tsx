import { Button, View, StyleSheet, Text, TextInput, SafeAreaView, FlatList, Linking, TouchableOpacity, Alert, Pressable } from 'react-native';
import React, { SetStateAction, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session';
import { CLIENT_ID, fetchGithubAccessToken } from '../services/GithubAccessTokenApi';
import { useGithubAuth } from '../hooks/useGithubAuth';
import { GithubRepo, fetchRepos } from '../services/GithubReposApi';
import { AntDesign } from '@expo/vector-icons'; 
import moment from 'moment';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { fetchAllRepos, createRepo, deleteRepo, RepoServerRepo } from '../services/RepoServerApi'
import { useService } from '../hooks/useService'
import Swipeout from 'react-native-swipeout';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${CLIENT_ID}`,
};


export default function HomeScreen() {
  const { setToken, token } = useGithubAuth();
	const [search, setSearch] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchDataSource, setSearchDataSource] = useState([]);
	const [sortedSavedDataSource, setSortedSavedDataSource] = useState<any>([]);
	const [sortOrderAsc, setSortOrderAsc] = useState(true);
  const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: CLIENT_ID,
			scopes: ['identity'],
			redirectUri: 'exp://'
		},
		discovery
  );
	const { data: savedRepos, refetch, updateOptimistically } = useService(
    fetchAllRepos
  );

	useEffect(() => {
		let sortedRepos;
		if (savedRepos && savedRepos?.length > 0) {
			if (!sortOrderAsc) {
				sortedRepos = savedRepos?.sort(
					(a: RepoServerRepo, b: RepoServerRepo) => {
						const countA = a.stargazersCount || 0;
						const countB = b.stargazersCount || 0;
						return countA < countB ? 1 : -1;
					})
			} else {
				sortedRepos = savedRepos?.sort(
					(a: RepoServerRepo, b: RepoServerRepo) => {
						const countA = a.stargazersCount || 0;
						const countB = b.stargazersCount || 0;
						return countA > countB ? 1 : -1;
					})
			}
			setSortedSavedDataSource(sortedRepos);
		}
	}, [savedRepos, sortOrderAsc]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      fetchGithubAccessToken(code)  
        .then((response) => {
          setToken(response?.data.access_token || '');
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [response]);

	useEffect(() => {
		if (search.length > 0) {			
			fetchRepos(search, 1, token)
			.then( response => {
				const items =  response?.data?.items.map((e: GithubRepo) => {
					return {
						created_at: e.created_at,
						full_name: e.full_name,
						id: e.id,
						language: e.language,
						stargazers_count: e.stargazers_count,
						html_url: e.html_url,
					};
				});
				setSearchDataSource(items);
			})
			.catch((e) => {
				console.error(e);
			});  
		}
	}, [search]);

	const SavedRepos = () => {
		return (
			<View style={{flex: 1}}>
				<FlatList
					ListHeaderComponent={() => {
						return(
							<Pressable style={styles.button} onPress={() => {
								if (sortOrderAsc) {

								}
								setSortOrderAsc(!sortOrderAsc);
							}}>
								
								<Text style={styles.text}>{sortOrderAsc ? 'Sort Stars ASC' : 'Sort Stars DSC'}</Text>
							</Pressable>
						)
					}}
					data={sortedSavedDataSource}
					keyExtractor={(item, index) => index.toString()}
					ItemSeparatorComponent={ItemSeparatorView}
					renderItem={SavedItemView}
				/>
			</View>
		);
	};
	
	const SavedItemView = ({ item }: { item: RepoServerRepo }) => {
		let swipeBtns = [{
      text: 'Delete',
      backgroundColor: 'red',
      underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
      onPress: () => { 		
				deleteRepo(item.id)
					.then(() => {
						Alert.alert("Successfully deleted repo");
						refetch();
					})
					.catch((e) => {
						console.error(e);
					}); 
				}
    }];

		return (
			<Swipeout right={swipeBtns}>
				<View style={styles.column}>
					<View style={styles.row}>
						<Text style={styles.itemStyle}>
							{item.fullName}
						</Text>
						<Text style={styles.itemStyle}>
							{item.language}
						</Text>
					</View>
					<View style={styles.row}>
						<View style={styles.starStyle}>
							<Text>
								{item.stargazersCount}
							</Text>
							<AntDesign name="star" size={24} color="gold" />
						</View>
						<Text style={styles.linkStyle} onPress={() => Linking.openURL(item.url)}>
							Link
						</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.itemStyle}>
							{moment(item.createdAt).format('DD-MMM-YYYY')}
						</Text>
					</View>
				</View>
			</Swipeout>
		);
	
	};

	const SearchRepos = () => {
		return (
			<View style={{flex: 1}}>
				<FlatList
					data={searchDataSource}
					keyExtractor={(item, index) => index.toString()}
					ItemSeparatorComponent={ItemSeparatorView}
					renderItem={ItemView}
				/>
			</View>
		);
	};
	
	const ItemView = ({ item }: { item: GithubRepo }) => {
		return (
			<TouchableOpacity onPress={() => {
				createRepo(item)
					.then(() => {
						Alert.alert("Successfully saved repo to server!!");
						refetch();
					})
					.catch((e) => {
						console.error(e);
						if (e.response.status === 409) {
							Alert.alert("Oops!! Looks like the repo is already added to the server");
						}
					});
			}}>
				<View style={styles.column}>
					<View style={styles.row}>
						<Text style={styles.itemStyle}>
							{item.full_name}
						</Text>
						<Text style={styles.itemStyle}>
							{item.language}
						</Text>
					</View>
					<View style={styles.row}>
						<View style={styles.starStyle}>
							<Text>
								{item.stargazers_count}
							</Text>
							<AntDesign name="star" size={24} color="gold" />
						</View>
						<Text style={styles.linkStyle} onPress={() => Linking.openURL(item.html_url)}>
							Link
						</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.itemStyle}>
							{moment(item.created_at).format('DD-MMM-YYYY')}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	
	};
	
	const ItemSeparatorView = () => {
		return (
			// Flat List Item Separator
			<View
				style={{
					height: 0.5,
					width: '100%',
					backgroundColor: '#C8C8C8',
				}}
			/>
		);
	};

	if (!token) {
		return (
			<View style={styles.container}>
				<Button
					disabled={!request}
					title="Login with github"
					onPress={() => {
						promptAsync();
					}}
				/>
			</View>
		);
	}
	return (
		<SafeAreaView style={{flex: 1}}>
   		<View>
        <SegmentedControlTab
          values={["Search Repos", "Saved Repos"]}
          selectedIndex={selectedIndex}
          onTabPress={(index) => setSelectedIndex(index)}
        />
      </View>
			{selectedIndex === 0 &&
				<>
					<TextInput
						style={styles.textInputStyle}
						onChangeText={setSearch}
						value={search}
						placeholder="Search Here"
					/> 
					<SearchRepos />
				</>
			}
			{
				selectedIndex === 1 && <SavedRepos />
			}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
		itemStyle: {
			padding: 10,
		},
		starStyle: {
			flexDirection :'row', 
			padding: 10, 
			justifyContent: 'space-between', 
			alignItems: 'center',
		},
		linkStyle: {
			padding: 10,
			color: 'blue',
			textDecorationLine: 'underline',
		},
		textInputStyle: {
			height: 40,
			borderWidth: 1,
			paddingLeft: 20,
			margin: 5,
			borderColor: 'black',
			backgroundColor: '#FFFFFF',
		},
		row: { 
			flex: 1, 
			flexDirection :'row', 
			justifyContent: 'space-between',
		},
		column: { 
			flex: 1, 
			flexDirection :'column',
		},
		button: {
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: 12,
			paddingHorizontal: 32,
			borderRadius: 4,
			elevation: 3,
			backgroundColor: 'black',
		},
		text: {
			fontSize: 16,
			lineHeight: 21,
			fontWeight: 'bold',
			letterSpacing: 0.25,
			color: 'white',
		},
  });
  