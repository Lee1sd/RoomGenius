import React from "react";
import '../../style/interiormenu.css';
import FolderImage from '../../assets/이미지/folder.png';
import ShareImage from '../../assets/이미지/share.png';
import PenImage from '../../assets/이미지/pencil.png';
import TextImage from '../../assets/이미지/textbox.png';
import PImage from '../../assets/이미지/painting.png';
import { Link } from "react-router-dom";
import PtwoImage from '../../assets/이미지/paint2.png';


function Interiormenu(){
    return(
        <div className="Interiorcont">
            <div className="interiorline2">

            <div className="projects">

            <div className="Projectdesign image-container">
                <Link to="/designcreate" className="Links">
                <div className="designbox" >
                <img src={PenImage} className="pen"></img>
                <span className="tooltiptext">Photo Room</span>
                </div>
                </Link>
            </div>

                    <div className="textProjectm image-container">
                        <Link to="/textpro" className="Links">
                            <div className="textpbox">
                                <img src={TextImage} className="text"></img>
                                <span className="tooltiptext">Text Room</span>
                            </div>
                        </Link>
                    </div>

                    <div className="paintProject image-container">
                        <Link to="/painting" className="Links">
                            <div className="Paintbox">
                                <img src={PImage} className="paint"></img>
                                <span className="tooltiptext">Sketch Room</span>
                            </div>
                        </Link>
                    </div>

                    <div className="painttwoProject image-container">
                        <Link to="/inpainting" className="Links">
                            <div className="Painttwobox">
                                <img src={PtwoImage} className="painttwo"></img>
                                <span className="tooltiptext">Repainting Room</span>
                            </div>
                        </Link>
                    </div>



            <div className="inteProject image-container">
                <Link to="/Myproject" className="Links">
                <div className="Probox">
                <img src={FolderImage} className="folder"></img>
                <span className="tooltiptext">My Project</span>
                </div>
                </Link>
            </div>



            <div className="inteshare image-container">
            <Link to="/gallery" className="Links">
                <div className="sharebox">
                    <img src={ShareImage} className="share"></img>
                    <span className="tooltiptext">Interior Gallery</span>
                </div>
             </Link>
            </div>
            
            </div>
        </div>
        </div>
    );
}

export default Interiormenu;