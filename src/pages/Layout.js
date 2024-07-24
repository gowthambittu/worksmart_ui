import React,{useState} from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';



const useStyles = makeStyles((theme) => ({
    navbar: {
        backgroundColor: '#131921',
        height: '50px',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
    button: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '1em',
        padding: '4px 10px',
        margin: theme.spacing(1),
        '&:hover': {
            backgroundColor: 'lightgray', // Change this to the color you want when hovering over the selected button
          },
    },
    selectedButton: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '1em',
        padding: '4px 10px',
        margin: theme.spacing(1),
        '&:hover': {
            backgroundColor: 'lightgray', // Change this to the color you want when hovering over the selected button
          },
      },
}));

const Layout = ({ children, username }) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const [selectedView, setSelectedView] = useState('properties');

    const handleNavigation = (path) => {
        setSelectedView(path);
        navigate(`/${path}`);
      };

    return (
        <div style={{ border: '2px solid green', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '-10px' }}>
            <Link to="/adminView" style={{ textDecoration: 'none', color: 'inherit' }}> {/* Add this */}
          <h1 style={{ fontSize: '1.5em',style:'bold' }}>WorkSmart</h1> {/* Decrease the font size */}
        </Link> {/* Add this */}
                <h3 style={{ backgroundColor: 'black', color: 'white', padding: '4px' }}>Welcome, {username}</h3> {/* Put the username in a black rectangular box */}
            </div>
            <hr style={{ borderColor: 'green', borderWidth: '1px' }} /> {/* Increase the thickness */}
            <AppBar position="static" className={classes.navbar}>
      <Toolbar className={classes.toolbar}>
        <Button 
          variant="outlined" 
          className={selectedView === 'properties' ? classes.selectedButton : classes.button} 
          onClick={() => handleNavigation('properties')}
        >
          Properties
        </Button>
        <Button 
          variant="outlined" 
          className={selectedView === 'outbound' ? classes.selectedButton : classes.button} 
          onClick={() => handleNavigation('outbound')}
        >
          Outbound
        </Button>
        <Button 
          variant="outlined" 
          className={selectedView === 'usermanagement' ? classes.selectedButton : classes.button} 
          onClick={() => handleNavigation('usermanagement')}
        >
          User Management
        </Button>
      </Toolbar>
    </AppBar>

            {children}
        </div>
    );
};

export default Layout;