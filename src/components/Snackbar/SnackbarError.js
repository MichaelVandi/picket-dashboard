import React, {PureComponent} from "react";
import {BiError} from "react-icons/bi";
import Styles from "./snackbarError.module.css";

export default class SnackbarError extends PureComponent {
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
                    [Styles.ActualSnackBarError, Styles.show].join(" ") :
                    Styles.ActualSnackBarError}>
                    <BiError color="#CF6679"
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
