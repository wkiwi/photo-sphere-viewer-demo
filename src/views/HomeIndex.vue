<template>
  <div id="viewer" style="width: 100vw; height: 100vh;"></div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue"
import { Viewer, utils } from '@photo-sphere-viewer/core';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { EquirectangularTilesAdapter } from '@photo-sphere-viewer/equirectangular-tiles-adapter';
import planeImg from "@/assets/plane.png"
import imgList from "@/data/index.js"
var markersPlugin,autorotate;
const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';
const currentImgItem = computed(() =>imgList.find(item => item.id === currentImgItemId.value))
const currentImgItemId = ref(imgList[0].id)
onMounted(() => {
  init();
})
const init = () => {
  const animatedValues = {
    pitch: { start: -Math.PI / 2, end: 0 },
    yaw: { start: Math.PI / 2, end: 0 },
    zoom: { start: 0, end: 50 },
    maxFov: { start: 130, end: 90 },
    fisheye: { start: 2, end: 0 },
  };
  const viewer = new Viewer({
    container: 'viewer',
    adapter:EquirectangularTilesAdapter, //切片加载
    panorama: {
        width: 8192,
        cols: 16,
        rows: 8,
        baseUrl: `${baseUrl}sphere-small.jpg`,
        tileUrl: (col, row) => {
            const num = row * 16 + col + 1;
            return `${baseUrl}sphere-tiles/image_part_${('000' + num).slice(-3)}.jpg`;
        },
    },
    caption: '作品版权<b>&copy; 社恐的王同学</b>',
    defaultPitch: animatedValues.pitch.start,
    defaultYaw: animatedValues.yaw.start,
    defaultZoomLvl: animatedValues.zoom.start,
    maxFov: animatedValues.maxFov.start,
    fisheye: animatedValues.fisheye.start,
    mousemove: false,
    mousewheel: false,
    navbar: [
      'autorotate',
      'zoom',
      {
        title: 'Rerun animation',
        content: '🔄',
        onClick: reset,
      },
      'caption',
      'fullscreen',
      'gallery',
      'gyroscope'
    ],
    plugins: [
      [AutorotatePlugin, { //过度动画插件
        autostartDelay: null,
        autostartOnIdle: false,
        autorotatePitch: 0,
      }],
      [GalleryPlugin, { //画廊列表插件
        visibleOnLoad: true,
        hideOnClick:false,
      }],
      [MarkersPlugin, {}], //标记插件
      [GyroscopePlugin] //陀螺仪插件
      
    ],
  });
  markersPlugin = viewer.getPlugin(MarkersPlugin);
  autorotate = viewer.getPlugin(AutorotatePlugin);

  let isInit = true;

  // setup timer for automatic animation on startup
  viewer.addEventListener('ready', (data) => {
    console.log('ready',data)
    // viewer.navbar.hide();
    setTimeout(() => {
      if (isInit) {
        intro(animatedValues.pitch.end, animatedValues.pitch.end);
      }
    }, 5000);
    // viewer.addEventListener('gallery.select',(event)=>{
    //   console.log('Gallery item selected:', event);
    // })
    initMarkers()
  }, { once: true });

  // launch animation to clicked point
  viewer.addEventListener('click', ({ data }) => {
    console.log('click',data)
    if (isInit) {
      intro(data.pitch, data.yaw);
    }
  });
  // viewer.addEventListener('render', ( data ) => {
  //   console.log('render',data)
  // });
  

  // perform the intro animation
  function intro(pitch, yaw) {
    isInit = false;
    autorotate.stop();
    viewer.navbar.hide();
    new utils.Animation({
      properties: {
        ...animatedValues,
        pitch: { start: animatedValues.pitch.start, end: pitch },
        yaw: { start: animatedValues.yaw.start, end: yaw },
      },
      duration: 2500,
      easing: 'inOutQuad',
      onTick: (properties) => {
        viewer.setOptions({
          fisheye: properties.fisheye,
          maxFov: properties.maxFov,
        });
        viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
        viewer.zoom(properties.zoom);
      },
    }).then(() => {
      autorotate.start();
      viewer.navbar.show();
      viewer.setOptions({
        mousemove: true,
        mousewheel: true,
      });
    });
  }

  // perform the reverse animation
  function reset() {
    isInit = true;
    autorotate.stop();
    viewer.navbar.hide();
    viewer.setOptions({
      mousemove: false,
      mousewheel: false,
    });

    new utils.Animation({
      properties: {
        pitch: { start: viewer.getPosition().pitch, end: animatedValues.pitch.start },
        yaw: { start: viewer.getPosition().yaw, end: animatedValues.yaw.start },
        zoom: { start: viewer.getZoomLevel(), end: animatedValues.zoom.start },
        maxFov: { start: animatedValues.maxFov.end, end: animatedValues.maxFov.start },
        fisheye: { start: animatedValues.fisheye.end, end: animatedValues.fisheye.start },
      },
      duration: 1500,
      easing: 'inOutQuad',
      onTick: (properties) => {
        viewer.setOptions({
          fisheye: properties.fisheye,
          maxFov: properties.maxFov,
        });
        viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
        viewer.zoom(properties.zoom);
      },
    });
  }
  //图片列表
  const gallery = viewer.getPlugin(GalleryPlugin);
  let itemArr =  imgList.map(item=>{
    return {
      id:item.id,
      panorama:item.panorama,
      thumbnail:item.thumbnail,
    }
  })
  gallery.setItems(itemArr,(id)=>{
    console.log(id)
    if(currentImgItemId.value == id){
      return 
    }
    currentImgItemId.value = id
    viewer.setPanorama(currentImgItem.value.panorama, {
        caption: currentImgItem.value.name,
        ...currentImgItem.value.options
      });
      // gallery.setActive(id);
    // intro(animatedValues.pitch.end, animatedValues.pitch.end);
    initMarkers();
    if (viewer.config.hideOnClick || gallery.isAboveBreakpoint) {
      gallery.hide();
    }
  });  
  // gallery.addEventListener('select',(event)=>{
  //   const index = event.index;
  //   const item = event.item;
  //   console.log(index,item)
  // })
}

// 重绘标记点
const initMarkers = async () => {
  markersPlugin.clearMarkers()
  if(!currentImgItem.value||!currentImgItem.value.markerList||!currentImgItem.value.markerList.length){
    return 
  }
  currentImgItem.value.markerList.forEach(markerItem => {
    const { pitch, yaw, markerId, title, desc, img } = markerItem
    markersPlugin.addMarker({
      position: { pitch, yaw },
      size: { width: 50, height: 50 },
      id: markerId,
      anchor: 'bottom center',
      image: planeImg, //baseUrl + 'pictos/pin-blue.png', //标记图标
      tooltip: {
        content: `<div class="tooltip-content">
                    ${img?'<img src="'+img+'">':''}
                  <h3>${title}</h3><p>${desc}</p></div>`,
        className: 'custom-tooltip',
        position: 'top',
        trigger: 'click',
      },
    })
  })
}
</script>

<style>
@import '@photo-sphere-viewer/core/index.css';
@import '@photo-sphere-viewer/gallery-plugin/index.css';
@import '@photo-sphere-viewer/markers-plugin/index.css';

html,
body,
#viewer {
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: sans-serif;
}

.custom-tooltip {
  max-width: none;
  width: 300px;
  box-shadow: 0 0 10px 2px white;
}

.custom-tooltip .psv-tooltip-content {
  padding: 0;
}

.custom-tooltip img {
  width: 100%;
  border-radius: 4px 4px 0 0;
}

.custom-tooltip h2,
.custom-tooltip p {
  margin: 1rem;
  text-align: justify;
}
</style>
