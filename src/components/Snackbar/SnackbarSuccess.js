import React, {PureComponent} from "react";
import Styles from "./snackbarSuccess.module.css";
import {FaCheckCircle} from "react-icons/fa";

export default class SnackbarSuccess extends PureComponent {
    message = "";

    state = {
        isActive: false,
    };

    openSnackBar = (message = "") => {
        this.message = message;
        this.setState({isActive: true}, () => {
            setTimeout(() => {
                this.setState({isActive: false});
            }, 3000);
        });
    };

    render() {
        const {isActive} = this.state;
        return (
            <div className = {isActive ?
                [Styles.snackbar, Styles.show].join(" ") : Styles.snackbar}>
                <div className = {isActive ?
                    [Styles.ActualSnackBarSuccess, Styles.show].join(" ") :
                    Styles.ActualSnackBarSuccess}>
                    <FaCheckCircle color="#00C4B4"
                        size="1.5em"
                        className = {isActive ?
                            [Styles.SnackbarIcon, Styles.show].join(" ") :
                            Styles.SnackbarIcon}/>
                    {this.message}
                </div>
            </div>
        );
    }
}
