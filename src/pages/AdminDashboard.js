import React, { useEffect } from 'react';
import Layout from './Layout';
import { Typography, List, ListItem, ListItemText } from '@material-ui/core';


const AdminDashboard = ({ username, authToken,handleAfterLogin }) => {

  useEffect(()=>{
    handleAfterLogin(true);
  })

    const menuItems = ['Properties', 'Outbound', 'User Management']; // Define menuItems here
    return (
  
        <Layout username={username}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {username}!
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          Use the following menu items to navigate:
        </Typography>
        <List component="nav" aria-label="main mailbox folders">
          {menuItems.map((item, index) => (
            <ListItem button key={index}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Layout>
    );
};

export default AdminDashboard;

