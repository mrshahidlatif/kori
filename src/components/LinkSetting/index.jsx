import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Typography from "@material-ui/core/Typography";
import { getChartsInEditor } from "ducks/charts";
import { ChartSetting } from "components/ChartSetting";
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import TuneIcon from '@material-ui/icons/Tune';
import BrushIcon from '@material-ui/icons/Brush';
import { Fragment } from "react";
import LinkIcon from '@material-ui/icons/Link';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';


const useStyles = makeStyles((theme) => ({
    chartAvatars: {
        display: 'flex',
        '& > *': {
          margin: theme.spacing(1),
        },
      },
    root: {
      width: 300,
    },
    toggleBtn:{
      margin: theme.spacing(1)
    },
    largeAvatar: {
        width: theme.spacing(7),
        height: theme.spacing(7),
      },
      largeAvatarActive: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        border: '1px solid #5e5d5d'
      },
  }));

export default function LinkSetting() {
    const classes = useStyles();
    const { docId } = useParams();
    const chartsInEditor = useSelector((state) => getChartsInEditor(state, docId));
    const textSelection = useSelector((state) => state.ui.textSelection);
    const showLinkSettingFor = useSelector((state) => state.ui.showLinkSettingFor);
    const [selectedChart, setSelectedChart] = useState(null);
    const [creationMode, setCreationMode] = useState('brush');
    const [createNewLink, setCreateNewLink] = useState(false)

    useEffect(()=>{
      if(!textSelection) {
        setCreateNewLink(false);
        setSelectedChart(null);
      }
      else {
        setCreateNewLink(true);
        setCreationMode('brush');
      }
    },[textSelection])

    function handleChartAvatarClick(chart){
        if(selectedChart != chart)
          setSelectedChart(chart);
        else setSelectedChart(null);
    }

    useEffect(()=>{
      setSelectedChart(chartsInEditor.filter(c => c.id === showLinkSettingFor?.chartId).pop());
    },[showLinkSettingFor])

    function handleModeChange(event, mode){
      if (mode !== null)
        setCreationMode(mode);
    }
  
    return (
      <React.Fragment>
        {createNewLink && <div className={classes.root}>
        <div style={{display:'flex'}}>
          <Typography variant="overline" display="block" gutterBottom>
              Link Setting
          </Typography>
          <Tooltip placement='right-start' title="Click on any chart to begin creating references!">
              <IconButton style={{marginTop:'-8px'}} size="small" aria-label="help">
                  <HelpIcon />
              </IconButton>
          </Tooltip>
        </div>
          <div className={classes.chartAvatars}>
              {chartsInEditor.map((chart) => (
                  <Avatar key={chart.id} src={chart.thumbnail} variant='rounded' className={chart.id === selectedChart?.id ? classes.largeAvatarActive: classes.largeAvatar} onClick={() => handleChartAvatarClick(chart)} />
              ))}
          </div>
          {selectedChart && <ToggleButtonGroup className={classes.toggleBtn}
                value={creationMode}
                exclusive
                onChange={handleModeChange}
                aria-label="text alignment"
                size='small'
                >
                <ToggleButton value="brush" aria-label="left aligned">
                    <BrushIcon />
                </ToggleButton>
                <ToggleButton value="filter" aria-label="centered">
                    <TuneIcon />
                </ToggleButton>
            </ToggleButtonGroup>}
          {selectedChart && <ChartSetting mode={creationMode} textSelection={textSelection} chart={selectedChart} />}
      </div>}
      {showLinkSettingFor && <div className={classes.root}>
          <Typography variant="overline" display="block" gutterBottom>
              Link Setting
          </Typography>
          <div className={classes.chartAvatars}>
              {chartsInEditor.map((chart) => (
                  <Avatar key={chart.id} src={chart.thumbnail} variant='rounded' className={chart.id === showLinkSettingFor?.chartId ? classes.largeAvatarActive: classes.largeAvatar} />
              ))}
          </div>
          {selectedChart && <ChartSetting textSelection={textSelection} chart={selectedChart} showLinkSettingFor={showLinkSettingFor} />}
      </div>}
      {!createNewLink && <Fragment>
          <Typography variant="overline" display="block" gutterBottom>
              Useful Shortcuts
          </Typography>
          <Tooltip placement='right-start' title="Press Tab key while at the end of a sentence or paragraph to get automatic suggestions!">
              <IconButton style={{marginTop:'-8px'}} size="small" aria-label="help">
                  <LinkIcon />
              </IconButton>
          </Tooltip>
          <Tooltip placement='right-start' title="Press @ key or select portion of text to triggers suggestions!">
              <IconButton style={{marginTop:'-8px'}} size="small" aria-label="help">
                  <MenuOpenIcon />
              </IconButton>
          </Tooltip>
          </Fragment>}
      </React.Fragment>
    );
}