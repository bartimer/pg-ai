import { Box, CircularProgress } from "@mui/material"
import React from "react"
import { useCustomContext } from "./CustomContext"

export function Spinner(){
   const {state, dispatch} = useCustomContext()
    
   if (state.loading)
        return <div className="cover-spin">
            Loading models...
        </div>
   return <></>
    
}