const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';
const imgList = [
  {
    id: 'sphere',
    panorama: {
      width: 6656,
      cols: 16,
      rows: 8,
      baseUrl: `${baseUrl}sphere-small.jpg`,
      tileUrl: (col, row) => {
          const num = row * 16 + col + 1;
          return `${baseUrl}sphere-tiles/image_part_${('000' + num).slice(-3)}.jpg`;
      },
    },
    thumbnail: baseUrl + 'sphere-small.jpg',
    // options: {
    //   caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
    // },
    markerList:[{
      pitch: 0.20313252017203376,
      yaw: 0.3866432675224853,
      markerId: '123',
      style: '',
      title: '测试',
      desc: '测试测试测试测试测试测试测试测试测试',
      img:'https://photo-sphere-viewer-data.netlify.app/assets/sphere-small.jpg'
    }]
  },
  {
    id: 'sphere-test',
    panorama: baseUrl + 'sphere-test.jpg',
    name: 'Test sphere',
  },
  {
    id: 'key-biscayne',
    panorama: {
      width: 6656,
      cols: 16,
      rows: 8,
      baseUrl: `${baseUrl}tour/key-biscayne-1.jpg`,
      tileUrl: (col, row) => {
          const num = row * 16 + col + 1;
          return `${baseUrl}sphere-tiles/image_part_${('000' + num).slice(-3)}.jpg`;
      },
    },
    thumbnail: baseUrl + 'tour/key-biscayne-1-thumb.jpg',
    name: 'Key Biscayne',
  },
]

export default imgList