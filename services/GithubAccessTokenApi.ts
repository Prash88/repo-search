import axios from "axios";

export const CLIENT_ID = 'e532775c66a66d881abf';
export const CLIENT_SECRET = '6d5358c8ba31b0e12dbb3a64cc5102da2fa1d592';

export const fetchGithubAccessToken = (
  code: string
): Promise<{ data: { access_token: string } } | void> => {
  return axios({
    method: "post",
    url: "https://github.com/login/oauth/access_token",
    data: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      scope: "user repos",
    },
    headers: {
      Accept: "application/json",
    },
  });
};