import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';



const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        background: '#f5f5f3',
    },
    topBar: {
        background: '#ffffff',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        [theme.breakpoints.down('xs')]: {
            padding: '0 16px',
        },
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: 'inherit',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#4ade80',
        flexShrink: 0,
    },
    logoText: {
        fontSize: 38,
        fontWeight: 600,
        lineHeight: 1,
        color: '#2c2c2c',
        [theme.breakpoints.down('xs')]: {
            fontSize: 30,
        },
    },
    userBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    username: {
        fontSize: 13,
        color: '#8a8a84',
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#EAF3DE',
        color: '#3B6D11',
        fontSize: 12,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBar: {
        background: '#1a1f2e',
        display: 'flex',
        gap: 4,
        padding: '0 24px',
        overflowX: 'auto',
        minHeight: 48,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '0 12px',
        },
    },
    navItem: {
        padding: '12px 16px',
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.55)',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        transition: 'color 0.2s ease, border-color 0.2s ease',
        '&:hover': {
            color: '#ffffff',
        },
    },
    navItemActive: {
        color: '#ffffff',
        borderBottom: '2px solid #4ade80',
    },
    content: {
        paddingBottom: 16,
    },
}));

const Layout = ({ children, username }) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname.toLowerCase();
    const navItems = [
        { label: 'Dashboard', path: '/adminView' },
        { label: 'Properties', path: '/properties' },
        { label: 'Outbound', path: '/outbound' },
        { label: 'User Management', path: '/usermanagement' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const initials = (username || 'U')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={classes.root}>
            <div className={classes.topBar}>
                <Link to="/adminView" className={classes.brand}>
                    <span className={classes.dot} />
                    <Typography component="h1" className={classes.logoText}>WorkSmart</Typography>
                </Link>
                <div className={classes.userBlock}>
                    <span className={classes.username}>{username || 'User'}</span>
                    <div className={classes.avatar}>{initials}</div>
                </div>
            </div>

            <div className={classes.navBar}>
                {navItems.map((item) => {
                    const isActive = item.path === '/adminView'
                        ? currentPath === '/adminview'
                        : currentPath.startsWith(item.path.toLowerCase());
                    return (
                        <Box
                            key={item.path}
                            className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            {item.label}
                        </Box>
                    );
                })}
            </div>

            <div className={classes.content}>{children}</div>
        </div>
    );
};

export default Layout;
