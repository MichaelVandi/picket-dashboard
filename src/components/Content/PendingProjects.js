import React, { Component } from 'react';
import { FlatList, TouchableOpacity, Text } from "react-native-web";
import { supabase } from './supabaseClient';

import { darkTheme } from '../Theme/Themes';
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
            showProposalModal: false,
            selectedProjectInModal: {},
            selectedProposalVotes: [],
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

    getProposalVoteState = async (id) => {

    }

    openNewTab = (url) => {
        window.open(url, '_blank');
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

    onHandRaiseClick = () => {
        this.setState({
            showProposalModal: true,
        })
    }

    capitalize = (s) => {
        return s[0].toUpperCase() + s.slice(1);
    }

    proposeBoycott = async () => {
        // Get website and reason
        const siteName = document.getElementById("sitename");
        const reason = document.getElementById("reason");

        if (!siteName.value.length || siteName.value.length < 1) {
            // siteName cannot be empty
            this._showSnackbarErrorHandler("Website name cannot be empty");
            return;
        }

        if (!reason.value.length || reason.value.length < 1) {
            // reason cannot  empty
            this._showSnackbarErrorHandler("Reason cannot be empty");
            return;
        }
        const siteTitle = String(siteName.value).split(".").slice(-2, -1)[0];
        // All good proceed
        await this.addProposition(
            this.state.user.creator_name,
            this.capitalize(siteTitle),
            siteName.value,
            this.state.user.profile_image,
            reason.value,
        )


    }

    addProposition = async (creator_name, website_name, website_url, profile_image, description) => {
        try {

            let { data, error, status } = await supabase

                .from('propositions')
                .insert([
                    {
                        creator: creator_name,
                        website_name: website_name,
                        website_url: website_url,
                        votes: 0,
                        profile_image: profile_image,
                        description: description,
                        yays: 0,
                    }
                ])

            if (error && status !== 406) {
                throw error
            }
            
            console.log("Proposition added (probably) (data doesn't return anything): ", data)
            document.location.reload();


        } catch (error) {
            alert(error.message)
        }
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

    getColor = (data) => {
        const colorMap = {
            "": "#FFB3B3", // red
            "": "#B2FFBA", // green
            "": "grey", // grey
        }
        return colorMap[data];
    } 

    renderProposalVoteState = () => {
        const voteStateData = this.state.selectedProposalVotes;
        const voteStateHTML = [];
        if (voteStateData.length < 1) {
            return [];
        }
        for (let i = 0; i < voteStateData; i++) {
            voteStateHTML.push(
                <div className="VerticalFlex vote-state-parent">
                    <div className="vote-state-img-parent" style={{
                        backgroundColor: `${this.getColor()}` // TODO: GET DATA
                    }}>

                    </div>

                </div>
            )
        }
    }

    openProposalVoteStateModal = () => {
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
              padding: "30px",
              backgroundColor: "#F1F1F1",
              borderRadius: "25px",
              transform: 'translate(-50%, -50%)',
            },
          };
        return (
            <Modal
                isOpen={this.state.showProposalModal}
                // onAfterOpen={afterOpenModal}
                onRequestClose={() => this.setState({
                    showProposalModal: false,
                })}
                style={customStyles}
                contentLabel="Project">

                    <div className="VerticalFlex CenterContents">




                        <div class="vertical-flex">

                            <p className="form-label">Website</p>
                            <div>
                                <input className="text-input-name" type="text" id="sitename" name="sitename" maxlength="50"
                                    placeholder="example.com"/>
                            </div>
                            

                        </div>


                        <br/>
                        <br/>
                        <div class="vertical-flex">
                            <p className="form-label">Reason</p>
                            <div>
                                <textarea id="reason" name="reason" rows="4" maxlength="250"
                                    className="reason-text-area"
                                    placeholder="Explain reason here"></textarea>
                            </div>
                            
                        </div>

                        <br/>
                        <br/>

                        <div className="primary-button"  
                            onClick={()=> this.applyVote("yay", this.state.selectedProjectInModal)}>Propose Boycott</div>
                                
                    </div>
            </Modal>
        )
    }

    openProposalModal = () => {
        const customStyles = {
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              height: "fit-content",
              width: "fit-content",
              overflowY: "scroll",
              padding: "30px",
              backgroundColor: "#F1F1F1",
              borderRadius: "25px",
              transform: 'translate(-50%, -50%)',
            },
          };
        return (
            <Modal
                isOpen={this.state.showProposalModal}
                // onAfterOpen={afterOpenModal}
                onRequestClose={() => this.setState({
                    showProposalModal: false,
                })}
                style={customStyles}
                contentLabel="Project">

                    <div className="VerticalFlex CenterContents">


                        <div class="vertical-flex">

                            <p className="form-label">Website</p>
                            <div>
                                <input className="text-input-name" type="text" id="sitename" name="sitename" maxlength="50"
                                    placeholder="example.com"/>
                            </div>
                            

                        </div>


                        <br/>
                        <br/>
                        <div class="vertical-flex">
                            <p className="form-label">Reason</p>
                            <div>
                                <textarea id="reason" name="reason" rows="4" maxlength="250"
                                    className="reason-text-area"
                                    placeholder="Explain reason here"></textarea>
                            </div>
                            
                        </div>

                        <br/>
                        <br/>

                        <div className="primary-button"  
                            onClick={()=> this.proposeBoycott()}>Propose Boycott</div>
                                
                    </div>
            </Modal>
        )
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

                <div className="hand-outline-div"
                    onClick={()=> this.onHandRaiseClick()}>
                    <img src={process.env.PUBLIC_URL + '/img/hand_outline.png'} alt="hand-outline" className="hand-outline" />
                </div>

                {this.openProjectModal()}
                {this.openProposalModal()}
                
            </div>
        );
    }
}


export default PendingProjects;
