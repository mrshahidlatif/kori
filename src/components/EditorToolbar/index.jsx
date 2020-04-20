
import React, { Fragment } from 'react';
import createToolbarPlugin, { Separator } from "draft-js-static-toolbar-plugin";
import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
import createResizeablePlugin from 'draft-js-resizeable-plugin';

import "draft-js-static-toolbar-plugin/lib/plugin.css";
import "draft-js-alignment-plugin/lib/plugin.css";
import "draft-js-focus-plugin/lib/plugin.css";
// import "draft-js-resizeable-plugin/lib/plugin.css";

import createChartBlockPlugin from 'utils/createChartBlockPlugin';

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton
} from "draft-js-buttons";
import { composeDecorators } from "draft-js-plugins-editor";


const toolbarPlugin = createToolbarPlugin();
const focusPlugin = createFocusPlugin();
const alignmentPlugin = createAlignmentPlugin();
const resizeablePlugin = createResizeablePlugin();

const { AlignmentTool } = alignmentPlugin;
const { Toolbar } = toolbarPlugin;
const decorator = composeDecorators(
  focusPlugin.decorator,
  resizeablePlugin.decorator,
  alignmentPlugin.decorator
);

const chartBlockPlugin = createChartBlockPlugin({ decorator });
export const EditorPlugins = [focusPlugin, resizeablePlugin, alignmentPlugin, toolbarPlugin, chartBlockPlugin];

export default function EditorToolbar() {
  return (
    <Fragment>
      <Toolbar>
        {// may be use React.Fragment instead of div to improve perfomance after React 16
          externalProps => (
            <div>
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <UnderlineButton {...externalProps} />
              <CodeButton {...externalProps} />
              <Separator {...externalProps} />
              <HeadlineOneButton {...externalProps} />
              <HeadlineTwoButton {...externalProps} />
              <HeadlineThreeButton {...externalProps} />
              <UnorderedListButton {...externalProps} />
              <OrderedListButton {...externalProps} />
              <BlockquoteButton {...externalProps} />
              <CodeBlockButton {...externalProps} />
            </div>
          )}
      </Toolbar>
      <AlignmentTool />
    </Fragment>

  )
}