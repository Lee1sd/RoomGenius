import React from "react";
import '../../style/main.css';
import Intro from './intro';
import Title1 from "./title1";
import Title2 from "./title2";
import Tab from "./Tab";
import Slide from "./slide";
import Slidecopy from "./slidecopy";
import Footer from "../../components/footer";


function Main(){

    return(
        <div className="RoomMain" style={{ margin: 0, padding: 0,}} >
            <Intro  className="roomstyle"></Intro>
            <Title1 className="roomstyle"/>
            <Tab className="roomstyle"/>
            <Slidecopy className="roomstyle"/>
            <Title2 className="roomstyle"/>
            <Footer className="roomstyle"/>
        </div>
    );
}
export default Main;