import React, { useEffect, useState } from 'react';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import logo from './logo.svg';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [hasAuthCode, setHasAuthCode] = useState(false);
    const [poolData, setPoolData] = useState(null);

    useEffect(() => {
        // Fetch poolid and clientid from authconfig.json
        fetch('http://localhost:3000/authconfig.json')
            .then(response => response.json())
            .then(data => {
                setPoolData({
                    UserPoolId: data.poolid,
                    ClientId: data.clientid
                });
            })
            .catch(error => console.error('Error:', error));
    }, []);

    useEffect(() => {
        if (!poolData) return;

        const userPool = new CognitoUserPool(poolData);
        const cognitoUser = userPool.getCurrentUser();

        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        if (authCode) {
            console.log('已經獲得授權碼:', authCode);
            setHasAuthCode(true);
        }

        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err) {
                    console.error(err);
                    setIsLoggedIn(false);
                    return;
                }
                setIsLoggedIn(session.isValid());

                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const userAttributes = {};
                    attributes.forEach(attr => {
                        userAttributes[attr.Name] = attr.Value;
                    });
                    console.log(userAttributes);
                });
            });
        } else {
            setIsLoggedIn(false);
        }

    }, [poolData]);

    useEffect(() => {
        if (isLoggedIn === true) {
            console.log("登入成功");
        } else if (isLoggedIn === false && !hasAuthCode) {
            console.log("need log in");
            setTimeout(() => {
                window.location.href = "https://auth.chillmonkey.tw/login?response_type=code&client_id=4099e555baq28bukg0aulp1a87&redirect_uri=http://localhost:3000";
            }, 3000);
        }
    }, [isLoggedIn, hasAuthCode]);

    const handleSignOut = () => {
        if (!poolData) return;

        console.log("Sign out button clicked!");
        const userPool = new CognitoUserPool(poolData);
        const user = userPool.getCurrentUser();

        if (user) {
            user.signOut();
            setIsLoggedIn(false);
            setHasAuthCode(false); // 清除授權碼狀態
            window.location.href = "http://localhost:3000";
        }
    }

    if (isLoggedIn === null || !poolData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>Welcome back! You are logged in.</p>
                <button onClick={handleSignOut}>
                    Sign Out
                </button>
            </header>
        </div>
    );
}

export default App;
