import React, { useState } from "react";
import Interiormenu from "./interiormenu";
import '../../style/share.css';

function Sharepage(){
    return(
        <>
        <div className="Shar">
        <Interiormenu/>
        <div className="ShareContent"></div>
        </div>

        </>
    );
}
export default Sharepage;