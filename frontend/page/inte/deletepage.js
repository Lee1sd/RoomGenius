import React from "react";
import Interiormenu from "./interiormenu";
import '../../style/delete.css';

function Deletepage(){
    return(
        <>
        <div className="Del">
        <Interiormenu/>
        <div className="DeleteContent"> </div>
        </div>
        </>
    );
}

export default Deletepage;