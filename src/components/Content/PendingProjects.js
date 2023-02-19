import React, { Component } from 'react';
import { FlatList, TouchableOpacity, Text } from "react-native-web";
import { fmsUrl } from '../../globalVariables';
import { supabase } from './supabaseClient';

import { darkTheme } from '../Theme/Themes';
import { FaTwitter, FaDiscord } from "react-icons/fa";
import { GrInstagram } from "react-icons/gr"
import { FiLink } from "react-icons/fi"
import SnackbarError from "../Snackbar/SnackbarError";
import SnackbarSuccess from "../Snackbar/SnackbarSuccess";
import {ThreeDots} from "react-loader-spinner";
import Modal from 'react-modal';

class PendingProjects extends Component {
    snackbarErrorRef = React.createRef();
    snackbarSuccessRef = React.createRef();
    constructor(props) {
        super(props);
        const user = this.props.user ? this.props.user : {};
        this.state = {
            data: [],
            dataLoading: true,
            user: user,
            showLoading: false,
            showProjectModal: false,
            selectedProjectInModal: {},
        };
    }

    componentDidMount() {
        this.getPendingVotes();
    }

    handleItemDescription = (desc) => {
        if (desc == null || !desc) {
            return "";
        }
        if (desc.length > 30) {
            return `${desc.substring(0, 30)}...`
        }
        return desc;
    }

    titleCase = (string) => {
        let sentence = string.toLowerCase().split(" ");
        for (let i = 0; i < sentence.length; i++) {
            sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
        }
        return sentence;
    };

    handleCreatorName = (name) => {
        if (name.length > 0) {
            return name;
        }
        return "Unknown";
    }

    shortenedAddress = (walletAddress) => {
        if (walletAddress === undefined) {
            return "";
        }
        return `${walletAddress.substring(0, 6)}...
            ${walletAddress.slice(-4)}`;
    };

    getPendingVotes = async () => {
        try {

            let { data, error, status } = await supabase
                .from('propositions')
                .select('*')

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                console.log(data)
                this.setState({
                    data: data,
                    dataLoading: false,
                });
                
            }

        } catch (error) {
            console.error(error);
            this.setState({
                data: [],
                dataLoading: false,
            });
        }

    }

    openNewTab = (url) => {
        window.open(url, '_blank');
    }

    renderSocials = (data) => {

        return (
            <div className={`HorizontalFlex
            CenterContentsVerticalInHorizontalFlex`}>
                {data.twitterUrl && (
                    <div className="SocialIconItemContainer"
                        onClick={() => this.openNewTab(data.twitterUrl)}>
                    <FaTwitter
                        color={darkTheme.socials}
                        size="1.2em" />
                    </div>
                )}
                
                {data.discordUrl && (
                    <div className="SocialIconItemContainer"
                        onClick={() => this.openNewTab(data.discordUrl)}>
                    <FaDiscord
                        color={darkTheme.socials}
                        size="1.3em" />
                    </div>
                )}
                
                {data.instagramUrl && (
                    <div className="SocialIconItemContainer"
                        onClick={() => this.openNewTab(data.instagramUrl)}>
                        <GrInstagram
                            color={darkTheme.socials}
                            size="1.1em" />
                    </div>
                )}
                
                {data.projectWebsite && (
                    <div className="SocialIconItemContainer"
                        onClick={() => this.openNewTab(data.projectWebsite)}>
                        <FiLink
                            color={darkTheme.socials}
                            size="1.1em" />
                    </div>
                )}
                
            </div>
        );
    };

    onApproveClick = (documentId) => {
        // alert(documentId)
        this.setState({
            showLoading: true,
        });
        const uid = this.state.user.uid;
        const approveUrl = new URL(fmsUrl + "/api/admin/approveproject");
        const data = {
            userId: uid,
            documentId: documentId,
        };

        fetch(approveUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then((response) => response.json())
            .then((response) => {
                if (response.metadata.result &&
                    response.metadata.result === "success") {
                    
                    let message = "Approved Successfully!";
                    if (response.metadata.but) {
                        message += " But " + response.metadata.but;
                    }

                    this.setState({
                        showLoading: false,
                    });

                    this._showSnackbarSuccessHandler(message);
                    // Refresh Pending projects
                    this.getPendingVotes();
                } else {
                    let message = "Failed Approval! ";
                    if (response.metadata.because) {
                        message += response.metadata.because;
                    }

                    this.setState({
                        showLoading: false,
                    });

                    this._showSnackbarErrorHandler(message);
                }
            }).catch((error) => {
                // TODO: Log this error
                this.setState({
                    showLoading: false,
                });
                console.error(error);
                this._showSnackbarErrorHandler(
                    "Approval Failed! " + JSON.stringify(error),
                );
            });

    }

    onDenyClick = (documentId) => {
        alert("Are you sure you want to deny this project?");
        // const uid = this.state.user.uid;
        this._showSnackbarErrorHandler("Denied");
    }

    _showSnackbarErrorHandler = (message) => {
        this.snackbarErrorRef.current.openSnackBar(message);
    };
    _showSnackbarSuccessHandler = (message) => {
        this.snackbarSuccessRef.current.openSnackBar(message);
    };
    onProjectClick = (project) => {
        this.setState({
            selectedProjectInModal: project,
            showProjectModal: true,
        })
    }

    applyVote = async (type, data) => {
        switch(type) {
            case "yay":
                await this.updateVote(data.id, data.votes + 1, data.yays + 1);
                break;
            case "nay":
                await this.updateVote(data.id, data.votes + 1, data.yays);
                break;
            case "abstain":
                await this.updateVote(data.id, data.votes + 1, data.yays);
                break;
            default:
                break;
        }
    }

    updateVote = async (proposition_id, votes, yays) => {
        try {

            let { data, error, status } = await supabase
                .from('propositions')
                .update({
                    votes: votes,
                    yays: yays,
                })
                .eq('id', proposition_id)

            if (error && status !== 406) {
                throw error
            }

            console.log("Vote updated")
            document.location.reload();

        } catch (error) {
            console.error(error.message)
        }
    }
    openProjectModal = () => {
        const customStyles = {
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              height: "fit-content",
              width: "80vw",
              overflowY: "scroll",
              padding: "20px",
              backgroundColor: "#F1F1F1",
              borderRadius: "25px",
              transform: 'translate(-50%, -50%)',
            },
          };
        return (
            <Modal
                isOpen={this.state.showProjectModal}
                // onAfterOpen={afterOpenModal}
                onRequestClose={() => this.setState({
                    showProjectModal: false,
                })}
                style={customStyles}
                contentLabel="Project">

                    <div>
                        <div>
                            <p className="single-tittle">
                                <mark className="purple-text">{this.state.selectedProjectInModal.creator}</mark> proposes boycotting <mark className="purple-text">{this.state.selectedProjectInModal.website_name} </mark>because...
                            </p>
                        </div>

                        <br/>

                        <div>
                            <p className="vote-description">{this.state.selectedProjectInModal.description}</p>
                        </div>

                        {/* Do you support div */}

                        <br/>
                        <br/>

                        <div>

                            <div>
                                <p className="center-text">Do you support the proposition?</p>
                            </div>

                            <br/>

                            <div className="HorizontalFlex CenterContents">

                                <div className="primary-button"  
                                    onClick={()=> this.applyVote("yay", this.state.selectedProjectInModal)}>YAY</div>
                                <div className="primary-button"
                                    onClick={()=> this.applyVote("abstain", this.state.selectedProjectInModal)}>ABSTAIN</div>
                                <div className="primary-button"
                                    onClick={()=> this.applyVote("nay", this.state.selectedProjectInModal)}>NAY</div>
                            </div>

                            <div>
                                {/* Label and reason */}
                            </div>

                            <div>
                                {/* Button */}
                            </div>

                            <div>
                                {/* Go back */}
                            </div>

                        </div>
                    </div>
            </Modal>
        )
    }

    renderPendingProject = (i) => {
        const item = i.item;
        const styles = {
            container: {
                backgroundColor: darkTheme.accentDarker,
                width: "fit-content",
                height: 30,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 6,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 15,
            },
            text: {
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: "normal",
            },
            textOutline: {
                color: darkTheme.accent,
                fontSize: 17,
                fontWeight: "normal",
            },
            outline: {
                borderColor: darkTheme.accent,
                // borderColor: darkTheme.socialsDark,
                borderWidth: 1, 
                width: "fit-content",
                height: 30,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 6,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 15,
            }
        };
        return (
            <div className="PendingProjectMainContainer">
                <div className={`HorizontalFlex PendingProjectContainer`}>

                    <div className="PendingProfilePhotoContainer">
                        <div className="PendingPhotoBackground">
                            <img className="PendingProfileImage"
                                alt="img"
                                src={item.profile_image} />
                        </div>
                        
                    </div>

                    <div className="PendingProjectInformationItem">
                        <p className="PendingProjectNameText" 
                            onClick={()=> this.onProjectClick(item)}>
                            {item.creator} on {item.website_name}</p>
                    </div>

                    <div className="PendingProjectInformationItem">
                        <p className="PendingDescriptionText">
                            {item.votes}/9</p>
                    </div>

                    <div className="PendingProjectInformationItem">
                        <p className="PendingDescriptionText">
                            {item.created_at}
                        </p>
                    </div>

                </div>
            </div>

        )
    }

    render() {
        return (
            <div className="DashboardVerticalSection">
                <br />
                <br />
                <br />
                <h2 className="title-text-vote"> Awaiting Your Vote</h2>
                <br />
                <SnackbarError ref = {this.snackbarErrorRef} />
                <SnackbarSuccess ref = {this.snackbarSuccessRef} />

                {this.state.showLoading &&
                    (<div className="SubmitLoadingContainer">
                        <ThreeDots
                            color="#EA8B6F"
                            visible={this.state.showLoading}
                            height={100} width={100} />

                        <p className="AddingProjectHelperText">
                        Adding vote...</p>
                    </div>
                    )
                }
                <br />
                <div className="PendingProjectsList">
                    <FlatList
                        data={this.state.data}
                        renderItem={this.renderPendingProject}
                        keyExtractor={(item) => item.id}
                    />
                </div>

                {this.openProjectModal()}
                
            </div>
        );
    }
}


export default PendingProjects;
