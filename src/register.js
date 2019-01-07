import React from 'react';
import addons from '@storybook/addons';
import Rect from '@reach/rect';

import {
  ADDON_ID,
  PANEL_ID,
  PANEL_Title,
  EVENT_ID_INIT,
  EVENT_ID_DATA,
  EVENT_ID_BACK,
} from './config';
import withChannel from './withChannel';

const panelDimesions = rect =>
  rect
    ? {
        width: rect.width,
        height: rect.height,
        isLandscape: rect.width >= rect.height,
      }
    : {};

const addonLayout = isLandscape => {
  const Layout = ({ style, children, ...props }) => (
    <div
      name="addon-layout"
      style={{
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        height: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
  return Layout;
};

const addonBlock = isLandscape => {
  const Block = ({ style, children, size, ...props }) => (
    <div
      name="addon-block"
      style={{
        flexGrow: 1,
        ...(size
          ? {
              ...(isLandscape ? { width: size } : { height: size }),
              flexGrow: undefined,
            }
          : {
              ...(isLandscape ? { width: 2 } : { height: 2 }),
            }),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
  return Block;
};

class PanelHOC extends React.Component {
  constructor(props) {
    super(props);
    const urlState = props.api.getUrlState();
    this.state = {
      ...urlState,
    };
    props.api.onStory((kind, story) => this.setState({ kind, story }));
  }
  render() {
    const Panel = this.props.component;
    const { api, active, data, setData } = this.props;
    const { kind, story } = this.state;

    if (!active) return null;

    return (
      <Rect>
        {({ rect, ref }) => {
          const dim = panelDimesions(rect);
          const Layout = addonLayout(dim.isLandscape);
          const Block = addonBlock(dim.isLandscape);
          return (
            <div ref={ref} name="addon-holder" style={{ height: '100%' }}>
              <Panel
                api={api}
                active={active}
                data={data}
                setData={setData}
                kind={kind}
                story={story}
                ADDON_ID={ADDON_ID}
                PANEL_ID={PANEL_ID}
                PANEL_Title={PANEL_Title}
                rect={dim}
                Layout={Layout}
                Block={Block}
              />
            </div>
          );
        }}
      </Rect>
    );
  }
}

const WithChannel = withChannel({
  EVENT_ID_INIT,
  EVENT_ID_DATA,
  EVENT_ID_BACK,
  initData: { foo: 'foo' },
  panel: true,
})(PanelHOC);

export const register = Panel =>
  addons.register(ADDON_ID, api => {
    addons.addPanel(PANEL_ID, {
      title: PANEL_Title,
      render: ({ active } = {}) => (
        <WithChannel
          api={api}
          active={active}
          ADDON_ID={ADDON_ID}
          PANEL_ID={PANEL_ID}
          PANEL_Title={PANEL_Title}
          component={Panel}
        />
      ),
    });
  });
