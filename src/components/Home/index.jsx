import React from 'react'
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import NavigationIcon from '@material-ui/icons/Navigation';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
function Home() {
    return (
        <Grid container spacing={3} justify="center">
            <Grid item xs={6}>
                <Typography variant="h2" gutterBottom>
                    Title
                </Typography>
                <Box marginBottom={2}>
                    <Typography variant="body1" gutterBottom>
                        Abstract
                    </Typography>
                </Box>                
                <Fab variant="extended" color="primary" aria-label="add" component={Link} to="/docs">
                    <NavigationIcon />
                    Get Started
                </Fab>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="overline" display="block" gutterBottom>
                    Teaser Image/Video
                </Typography>
            </Grid>
        </Grid>

    )
}

export default Home
