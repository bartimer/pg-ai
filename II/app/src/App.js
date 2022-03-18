import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link} from "react-router-dom";
import React from 'react';
import ResponsiveAppBar from './AppBar';
import { SensorPage } from './SensorPage';
import { Button, Container } from '@mui/material';
import { Branch } from './Branch';
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactComponent as Architecture } from './assets/IOT-assigment.svg';
import { IIContainer } from 'intelligent-interfaces/IIContainer';
function Home() {

  return <div>
    <h3>Assigment Big Data & IOT</h3>
    <p>Welcome to the assignment page for the assigment of Big Data & IOT. </p>
    <p>The idea of this site is to get a visual overview of the locations of the sensors per branch.
      For each sensor you can request details about current state.
      For every sensor you can drill down into history of its measurements</p>

    <p><Button component={Link} to="/branch">Go to Anderlecht KAAI branch</Button></p>
    <h4>The architecture of the solution</h4>
    <div style={{ width: '80%' }}>
      <Architecture></Architecture>
    </div>
  </div>

}

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div>
          <ResponsiveAppBar></ResponsiveAppBar>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/branch" element={<Branch />}>
              </Route>
              <Route path="/intelligent-interfaces" element={<IIContainer />}>
              </Route>

              <Route path="/sensors/:id" element={<SensorPage />}>
              </Route>

              <Route path="/" element={<Home />}>
              </Route>
            </Routes>
          </Container>
        </div>
      </Router>
    </QueryClientProvider>


  );
}

export default App;
