import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withStateSelector from './utils/withStateSelector';
import withHandlers from 'recompose/withHandlers';
import withState from 'recompose/withState';
import withContext from 'recompose/withContext';
import withProps from 'recompose/withProps';
import withPropsOnChange from 'recompose/withPropsOnChange';
import ptInBounds from './utils/ptInBounds';
import GoogleMapReact from '../src';
import SimpleMarker from './markers/SimpleMarker';
import { createSelector } from 'reselect';
import { susolvkaCoords, generateMarkers } from './data/fakeData';

import {
  MapWithClusteringfactory,
} from '../src/utils/clusterer/googleMapWithClustering';
import ClusterMarker from './markers/ClusterMarker.js';
import {
  animatedMarkerFactory,
} from '../src/utils/clusterer/animatedMarkerFactory.js';

const GoogleMapWithClustering = MapWithClusteringfactory(
  GoogleMapReact,
  ClusterMarker,
  ClusterMarker
);
const AnimatedSimpleMarker = animatedMarkerFactory(SimpleMarker);

export const gMap = (
  {
    style,
    hoverDistance,
    options,
    mapParams: { center, zoom },
    onChange,
    onChildMouseEnter,
    onChildMouseLeave,
    markers,
    draggable, // hoveredMarkerId,
  }
) => (
  <GoogleMapWithClustering
    draggable={draggable}
    style={style}
    options={options}
    hoverDistance={hoverDistance}
    center={center}
    zoom={zoom}
    onChange={onChange}
    apiKey={'AIzaSyC-BebC7ChnHPzxQm7DAHYFMCqR5H3Jlps'}
    onChildMouseEnter={onChildMouseEnter}
    onChildMouseLeave={onChildMouseLeave}
  >
    {markers}
  </GoogleMapWithClustering>
);

export const gMapHOC = compose(
  defaultProps({
    clusterRadius: 60,
    hoverDistance: 30,
    options: {
      minZoom: 1,
      maxZoom: 15,
    },
    style: {
      position: 'relative',
      margin: 0,
      padding: 0,
      flex: 1,
    },
  }),
  withContext({ hello: PropTypes.string }, () => ({ hello: 'world' })),
  // withState so you could change markers if you want
  withStateSelector('markers', 'setMarkers', () =>
    createSelector(
      ({ route: { markersCount = 20 } }) => markersCount,
      markersCount => generateMarkers(markersCount)
    )),
  withState('hoveredMarkerId', 'setHoveredMarkerId', -1),
  withState('mapParams', 'setMapParams', { center: susolvkaCoords, zoom: 6 }),
  // describe events
  withHandlers({
    onChange: ({ setMapParams }) =>
      ({ center, zoom, bounds }) => {
        setMapParams({ center, zoom, bounds });
      },
    onChildMouseEnter: ({ setHoveredMarkerId }) =>
      (hoverKey, { id }) => {
        setHoveredMarkerId(id);
      },
    onChildMouseLeave: ({ setHoveredMarkerId }) =>
      () => {
        setHoveredMarkerId(-1);
      },
  }),
  withPropsOnChange(['markers', 'mapParams'], ({
    markers,
    mapParams: { bounds },
  }) => ({
    markers: bounds ? markers.filter(m => ptInBounds(bounds, m)) : [],
  })),
  withProps(({ hoveredMarkerId }) => ({
    draggable: hoveredMarkerId === -1,
  })),
  withPropsOnChange(['markers'], ({ markers }) => ({
    markers: markers.map(({ ...markerProps, id }) => (
      <AnimatedSimpleMarker key={id} id={id} {...markerProps} />
    )),
  }))
);

export default gMapHOC(gMap);
