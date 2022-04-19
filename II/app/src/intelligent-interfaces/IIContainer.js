import React from "react";
import { Route, Routes } from "react-router-dom";
import { RockPaperScissor } from "./RockPaperScissor";




export function IIContainer(){
    return <>
        <Routes>
                 <Route exact path='' element={< RockPaperScissor />}></Route>
         </Routes>
    </>
}