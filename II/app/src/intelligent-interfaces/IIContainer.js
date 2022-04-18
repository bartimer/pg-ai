import React from "react";
import { Route, Routes } from "react-router-dom";
import { RockPaperScissor } from "./RockPaperScissor";




export function IIContainer(){
    return <>
        <h3>Intelligent interfaces</h3>
        <Routes>
                 <Route exact path='' element={< RockPaperScissor />}></Route>
                
          </Routes>
    </>
}