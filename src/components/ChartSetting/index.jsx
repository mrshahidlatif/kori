import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSelector} from "react-redux";
import addSignalToChartSpec from "utils/addSignalToChartSpec";
import vegaEmbed from "vega-embed";
import { parse } from "vega-parser";
import { View } from "vega-view";
import ChartConfigPanel from "components/ChartConfigPanel";
import { useParams } from "react-router-dom";
import ManualLinkControls from "components/ManualLinkControls";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import EditLinkSetting from "components/EditLinkSetting"
import { showSelectedLinkSetting } from "ducks/ui";
import HelpIcon from '@material-ui/icons/Help';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import TuneIcon from '@material-ui/icons/Tune';
import BrushIcon from '@material-ui/icons/Brush';

export function ChartSetting(props) {
    const [view, setView] = useState(null);
    const containerEl = useRef(null);
    const chartEl = useRef(null);
    const [ratio, setRatio] = useState(1);
    let { docId } = useParams();
    const doc = useSelector((state) => state.docs[docId]);
    const [selectedMarks, setSelectedMarks] = useState([]);
    const [viewData, setViewData] = useState([]);
    const [brush, setBrush] = useState([]);
    const [toggleSettings, setToggleSettings] = useState(false);
    const selectedLink = useSelector((state)=> state.ui.selectedLink);
    const [creationMode, setCreationMode] = useState(0);

    const {chart} = props;
    const spec = useMemo(
        () =>
            addSignalToChartSpec(
                chart.highlight,
                JSON.parse(JSON.stringify(chart.liteSpec)),
                true
            ),
        [chart.spec, chart.highlight]
    );

    useEffect(() => {
        const asyncExec = async () => {
            // compute canvas aspect ratio to maintain it while resizing
            const runtime = parse(spec);
            const tempView = await new View(runtime).runAsync();

            const canvas = await tempView.toCanvas();
            const ratio = canvas.height / canvas.width;
            setRatio(ratio);

            // add autosize: has limitations: https://vega.github.io/vega-lite/docs/size.html#limitations
            //TODO: brush interfere with autosize

            // spec.autosize = {
            //     type: "fit",
            //     contains: "padding",
            //     resize: true,
            // };
            const result = await vegaEmbed(chartEl?.current, spec, { actions: false });
            const view = result.view;

            // const viewData = view.data("source_0");
            const viewData = !chart.liteSpec.data.hasOwnProperty("url")
                ? view.data("data_0")
                : view.data("source_0");
            setViewData(viewData);
            try {
                view.addDataListener("paintbrush_store", function (name, value) {
                    console.log(name, value);
                    setSelectedMarks(selectedMarks.concat(value));
                });

                view.addDataListener("brush_store", function (name, value) {
                    console.log(name, value);
                    setBrush(brush.concat(value));
                });
            } catch (error) {
                //No brush_store if no brush added
            }
            setView(view);
        };
        asyncExec();
    }, [spec]);

    // useEffect(
    //     throttle(async () => {
    //         resize(view, ratio);
    //     }, 500)
    // );

    function resize(view, ratio) {
        if (view) {
            const { width } = containerEl.current.getBoundingClientRect();
            const height = ratio * width;
            // view.resize().height(height).width(width).runAsync();
        }
    }

    function handleSettingClick() {
        setToggleSettings(!toggleSettings);
    }
    function handleModeChange(event, mode){
        console.log('mode', mode);
        setCreationMode(mode);
    }

    const showConfig = true;
    const highlightStyle = {
        position: "relative",
        width: "fit-content",
    };

    return (
        <React.Fragment>
            <ToggleButtonGroup
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
            </ToggleButtonGroup>
            <div ref={containerEl} style={highlightStyle}>
                <div>
                    {showConfig && <div style={{display:'flex'}}> 
                        <IconButton
                            onMouseDown={handleSettingClick}
                            aria-label="settings"
                            // color="primary"
                        >
                            <SettingsIcon />
                        </IconButton>
                        <Tooltip placement='right-start' title="Use brushing to select visual marks on the chart! Hold down the SHIFT key to select multiple marks!">
                            <IconButton style={{marginTop:'0px'}} aria-label="help">
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                    }
                </div>
                <div ref={chartEl} />
                {showConfig && toggleSettings && <ChartConfigPanel chart={chart} />}
                {showConfig && props.textSelection && (
                    <ManualLinkControls
                        currentDoc={doc}
                        selectedChart={chart}
                        textSelection={props.textSelection}
                        selectedMarks={selectedMarks}
                        brush={brush}
                        viewData={viewData}
                        mode={creationMode}
                    />
                )}
                
                {props.showLinkSettingFor && (
                    <EditLinkSetting
                        currentDoc={doc}
                        selectedChart={chart}
                        selectedMarks={selectedMarks}
                        brush={brush}
                        viewData={viewData}
                        showLinkSettingFor={props.showLinkSettingFor}
                        selectedLink={selectedLink}
                    />
                )}
            </div>
        </React.Fragment>
    );
};