import Header from "./Header";
// import PeopleCardContainer from "./PeopleCardContainer";
// import ReachStatistics from "./ReachStatistics";
// import GenderGeoStatistics from "./GenderGeoStatistics";
import PendingProjects from "./PendingProjects";
import {getAuth, signInWithCustomToken,
    signInWithEmailAndPassword} from "firebase/auth";
import {apiUrl} from '../../globalVariables';
import React, { Component } from 'react';

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginStatisfied: true,
            username: "",
            password: "",
            errorText: "",
            signUpLoading: true,
            renderLogin: false,
            user: {},
        };
    }

    onUsernameFormSubmit = (event) => {
        event.preventDefault();
        const username = this.state.username.toString().toLowerCase();
        const password = this.state.password;
        const email = `${username}@ratemynft.app`;

        this.signInWithPassword(email, password);
    };

    componentDidMount(){
        // this.updateAuth();
    }

    updateAuth = () => {
        const auth = getAuth();
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                // const uid = user.uid.toString();
                this.validateAdmin(user);
            } else {
                // No user
                this.setState({
                    renderLogin: true,
                })
            }
        });
    };

    signInWithPassword = (email, password) => {
        if (!email || !password) return;
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                this.setState({
                    signUpLoading: false,
                    user: userCredential,
                });
                this.validateAdmin(userCredential.user);
            })
            .catch((error) => {
                const errorMessage = error.message;
                let errorToShow = "Sorry something went wrong";
                if (errorMessage.includes("user-not-found")) {
                    errorToShow =
                        "Sorry we could not find an account for this username";
                }
                if (errorMessage.includes("wrong-password")) {
                    errorToShow =
                        "Incorrect Password";
                }
                this.setState({
                    signUpLoading: false,
                    loginStatisfied: false,
                    errorText: errorToShow,
                    renderLogin: true,
                });
            });
    };

    validateAdmin = (user) => {
        const userId = user.uid;
        const loginUrl = new URL(apiUrl + "/admin/login");
        const data = {
            userId: userId,
        };

        fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then((response) => response.json())
            .then((response) => {
                if (response.metadata.result &&
                    response.metadata.result === "success") {

                    this.signInWithToken(response, user);

                } else {
                    this.setState({
                        signUpLoading: false,
                        errorText: "Sorry something went wrong." +
                        " Please try again",
                    });
                    
                }
            }).catch((error) => {
                // TODO: Log this error
                console.error(error);
                this.setState({
                    signUpLoading: false,
                    errorText: "Sorry something went wrong." +
                    " Please try again",
                });
            });
    }

    onSignInDone = () => {
        // Open the main dashboard
        this.setState({
            loginStatisfied: true,
        })
    }

    signInWithToken = (data, user) => {
        const auth = getAuth();
        const token = data.data.token;
        signInWithCustomToken(auth, token).then((userCredential) => {
            // Signed In
            this.setState({
                signUpLoading: false,
                renderLogin: false,
                user: user,

            });
            this.onSignInDone();
        }).catch((error) => {
            // Error signing in
            this.setState({
                signUpLoading: false,
                renderLogin: true,
                errorText: "Sorry something went wrong. You may be unauthorized",
            });
            // console.error(error);
            // TODO: Log This
        });
    };

    handlePasswordChange = (e) => {
        const val = e.target.value;
        this.setState({
            password: val,
        });
    };
    handleUsernameChange = (e) => {
        const val = e.target.value;
        this.setState({
            username: val,
        });
    };

    render() {
        return  <div>
                    <Header key={this.state.loginStatisfied} user={this.state.user}/>
                    {/* <PeopleCardContainer />
                    <ReachStatistics /> */}
                    {/* <GenderGeoStatistics /> */}
                    <PendingProjects key={this.state.loginStatisfied} user={this.state.user}/>
                </div>
           
    }
}
export default Content;