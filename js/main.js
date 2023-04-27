import * as THREE from './three.module.js';
import anime from './anime.es.js';

import { OrbitControls } from './extra/OrbitControls.js';
import { GLTFLoader } from './extra/GLTFLoader.js';
import { RGBELoader } from './extra/RGBELoader.js';
import { RoughnessMipmapper } from './extra/RoughnessMipmapper.js';


// THREE JS vars
var camera, scene, renderer, controls;
// \ THREE JS vars

// DOM vars
var hideSelector = 'hide-completely';
var homePageEl, aboutPageEl, listingsPageEl, infoPageEl, contactPageEl, closeContactPageEl;
var homeNavButton, homeImageNavButton, aboutNavButton, listingsNavButton, infoNavButton, contactNavButton, closeContactNavButton;
var loadingText;
// \DOM vars

init();

function init() {
  showSplash();
  setupScene();
  setCallbacks();

}
var pointAnimation, wavesAnimation;
function showSplash(){
  pointAnimation = anime({
    targets: ".point-animated",
    translateX: 15,
    duration: 800,
    loop: true,
    direction: 'alternate',
    easing: "easeOutCubic"
  });

}
var isSplashHidden = false;
function hideSplash(){

  if(isSplashHidden == false){
    setTimeout(() => {
      cancelAnimation(pointAnimation);
      hideElement($('.splash'));
      onNavButtonHome();
    }, 500);
  }

  isSplashHidden = true;
}

function findDomElements(){

  homePageEl = $('#home-page');
  aboutPageEl = $('#about-us-page');
  listingsPageEl = $('#listings-page');
  infoPageEl = $('#info-page');
  contactPageEl = $('#contact-page');


  homeNavButton = $('#nav-button-home');
  homeImageNavButton = $('#nav-button-home-image');
  aboutNavButton = $('#nav-button-about');
  listingsNavButton = $('#nav-button-listings');
  infoNavButton = $('#nav-button-info');
  contactNavButton = $('#contact-us-button');
  closeContactPageEl = $('#close-contact-button');

  loadingText = $('.splash-loading-text');

}

function setCallbacks(){
  findDomElements();

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener("touchmove", mouseMove, false);

  homeNavButton.on( 'mousedown', onNavButtonHome );
  homeImageNavButton.on( 'mousedown', onNavButtonHome );
  aboutNavButton.on( 'mousedown', onNavButtonAbout );
  listingsNavButton.on( 'mousedown', onNavButtonListings );
  infoNavButton.on( 'mousedown', onNavButtonInfo );
  contactNavButton.on( 'mousedown', onNavButtonContact );
  closeContactPageEl.on( 'mousedown', onCloseContactPage );
}

function setBackground(){

    wavesAnimation = anime({
      targets: '#bg svg .waves',
      easing: 'easeInOutQuad',
      delay: anime.stagger(1000),
      translateX: () => { return anime.random(-70,0) + '%'; },
      duration: 40000,
      loop: true,
      direction: 'alternate'
    });
}

function setupScene(){
  setBackground();
  setupRenderer();
  addModel();
  // lookAtModelHack();
}

function setupRenderer(){

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  // camera.position.set( 1, 1, 2 );
  camera.position.set( -1, 4, 0 );
  // camera.position.set( -.78, 3, 0.1 );
  // camera.rotation.x =  * Math.PI / 180;
  camera.lookAt(-2, -3, -4);

  scene = new THREE.Scene();

  // loader.load( '../images/sky.png', function ( texture ) {

  // setBackgroundTexture( texture );
  // scene.environment = texture;

  // texture.dispose();
  // renderThreeJS();

  renderer = new THREE.WebGLRenderer( {
    canvas: bgCanvas,
    alpha:true ,
    antialias: false
  } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.4;
  renderer.outputEncoding = THREE.sRGBEncoding;

}

function addModel(){
  // use of RoughnessMipmapper is optional
  var roughnessMipmapper = new RoughnessMipmapper( renderer );

  var loader = new GLTFLoader().setPath( 'models/' );
  loader.load(
    // MODEL
    'SD_1_hq.glb'

    // LOADED CALLBACK
    , function ( gltf ) {

      gltf.scene.traverse( function ( child ) {

        if ( child.isMesh ) {

          roughnessMipmapper.generateMipmaps( child.material );

          // lookAt( child );
          child.frustumCulled = false;

          var texture = child.material.map;
          child.material = getCurvedMat( texture );

          // var position = new THREE.Vector3();
          // position.setFromMatrixPosition( child.matrixWorld );
          // print( "mesh pos: " + position.x + ", " + position.y + ", " + position.z  );
        }

      });

      scene.add( gltf.scene );
      // scene.overrideMaterial = getCurvedMat();

      roughnessMipmapper.dispose();

      renderThreeJS();

      showHomePageAnimation();
    },

    // PROGRESS CALLBACK
    function ( xhr ) {
      loadingText.text(Math.round( xhr.loaded / xhr.total * 100 ) + '%')
      // console.log(  );

      if(xhr.loaded >= xhr.total ){
        hideSplash();
      }
    },

    // ERROR CALLBACK
    function ( error ) {
      hideSplash();
      console.log( 'An error occured while loading the 3d.' );

    }
  );

}

function lookAtModelHack(){

  controls = new OrbitControls( camera, renderer.domElement );
  // controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 1;
  controls.maxDistance = 1000;
  controls.target.set( -2, -2, -4.3 );

  controls.update();
}

var mouse = {
  x: 0,
  y: 0
};

var cameraMoves = {
  speed: 1,
  moving: false
};

function mouseMove(e) {

  if(camera == null){
    return;
  }

  cameraMoves.moving = true;
  // print((e.clientX - mouse.x) * 0.0005);

  camera.position.x += (e.clientX - mouse.x) * 0.0005;
  camera.position.z += (mouse.y - e.clientY) * 0.0005;

  mouse.x = e.clientX;
  mouse.y = e.clientY;
  renderThreeJS();
  cameraMoves.moving = false;

}

const map = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// home  functionality
var testFireButton = 0;


function showHomePageAnimation(){
  // Wrap every letter in a span
  var textWrapper = document.querySelector('.ml14 .letters');
  textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
  var textWrapper = document.querySelector('.ml7 .letters');
  textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

  anime.timeline({ loop: false, autoplay: true })
  .add(logoAnimation1)
  .add(logoAnimation2)
  .add(logoAnimation3)
  .add(logoAnimation4)
  .add(homeText1Animation1)
  .add(homeText1Animation2)
  .add(homeText2Animation1)
  // .add(homeText2Animation2);
}

// sdpr logo animation

function onNavButtonHome(  ){
  print(" clicked home " + (testFireButton++));
  toggleVisibilityFor( homePageEl );
  showHomePageAnimation();

  $(  '.nav-item > a.active ').removeClass('active');
  $( homeNavButton ).addClass('active');
}
// \home

// about functionality
function onNavButtonAbout(  ){
  print(" clicked about " + (testFireButton++));
  toggleVisibilityFor(aboutPageEl);

  $(  '.nav-item > a.active ').removeClass('active');
  $( aboutNavButton ).addClass('active');

}
// \about

// listings functionality
function onNavButtonListings(  ){
  print(" clicked listings " + (testFireButton++));
  toggleVisibilityFor(listingsPageEl);

  $( '.nav-item > a.active ' ).removeClass('active');
  $( listingsNavButton ).addClass('active');

}
// \listings

// info functionality
function onNavButtonInfo(  ){
  print(" clicked info " + (testFireButton++));
  toggleVisibilityFor(infoPageEl);

  $(  '.nav-item > a.active ').removeClass('active');
  $( infoNavButton ).addClass('active');

}
// \info

// contact functionality
function onNavButtonContact(  ){
  print(" clicked contact " + (testFireButton++));
  contactPageEl.toggleClass(hideSelector);
}

function onCloseContactPage(  ){
  print(" clicked home " + (testFireButton++));
  hideElement(contactPageEl);
}
// \ contact

function toggleVisibilityFor ( element ){
  showElement(element);

  if(element !== homePageEl){
    hideElement(homePageEl);
  }

  if(element !== aboutPageEl){
    hideElement(aboutPageEl);
  }

  if(element !== infoPageEl){
    hideElement(infoPageEl);
  }

  if(element !== listingsPageEl){
    hideElement(listingsPageEl);
  }
}

function hideElement( element ){
  element.addClass(hideSelector);
}

function showElement(element){
  element.removeClass(hideSelector);
}

function getVertexShader() {
  return `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 vertPos = modelViewMatrix * vec4( position, 1.0 );
    vertPos = vec4(vertPos.x, vertPos.y - ((vertPos.z * vertPos.z * 0.09) + (vertPos.x * vertPos.x * 0.05)), vertPos.z, vertPos.w);
    gl_Position = projectionMatrix * vertPos;
  }
  `
}

function getFragmentShader() {
  return `
  #include <common>

  uniform vec3 iResolution;
  uniform sampler2D iChannel0;

  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;

    vec4 color = texture2D( iChannel0, uv );

    fragColor = color;
  }
  varying vec2 vUv;

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
  `
}



function getCurvedMat( texture ) {

  let uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3(1,1,1) },
    iChannel0: { value: texture },
  };

  let material =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: getFragmentShader(),
    vertexShader: getVertexShader()
  });

  return material;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  renderThreeJS();

}
//
function lookAt( mesh ){
  var position = new THREE.Vector3();
  position.setFromMatrixPosition( mesh.matrixWorld );
  position.z -= 5;
  camera.lookAt( position );
}

function renderThreeJS() {
  renderer.render( scene, camera );
}

function print( val ){
  console.log(val);
}

function setBackgroundTexture( texture ){


  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;;
  scene.background = texture;

}

function lerp(v0, v1, t) {
  return v0*(1-t)+v1*t
}



const homeText2Animation1 = ({
  targets: '.ml7 .letter',
  begin: () => {showElement( $("#header-textbox-2") )},
  translateY: ["1.2em", 0],
  // translateX: ["0.55em", 0],
  translateZ: 0,
  // rotateZ: [180, 0],
  duration: 350,
  easing: "easeOutExpo",
  delay: (el, i) => 10 * i
}) ;


const homeText1Animation1 = ({
  targets: '.ml14 .line',
  begin: () => {showElement( $("#header-textbox-1") )},
  scaleX: [0,1],
  opacity: [0.5,1],
  easing: "easeInOutExpo",
  duration: 900
});

const homeText1Animation2 = ({
  targets: '.ml14 .letter',
  opacity: [0,1],
  translateX: [40,0],
  translateZ: 0,
  scaleX: [0.3, 1],
  easing: "easeOutExpo",
  duration: 800,
  offset: '-=600',
  delay: (el, i) => 150 + 25 * i
});

const homeText1Animation3 = ({
  targets: '.ml14',
  end:  () => hideElement( $("#header-textbox-1") ),
  opacity: 0,
  duration: 500,
  easing: "easeOutExpo",
});
// end sdpr logo animation


const logoAnimation1 = ({
  duration: 200,
  begin:  () => {showElement( $("#header-graphic-1") )},
  opacity: [0, 1],
  fillOpacity: [0, 1],
  easing: 'linear',
  targets: '#header-graphic-1 .lines-bg .sdpr-circle-bg',
});

const logoAnimation2 = ({
  targets: '#header-graphic-1 .lines .sdpr-path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 2000,
  delay: anime.stagger(100),
  direction: 'alternate',
  loop: false
});

const logoAnimation3 = ({
  targets: '#header-graphic-1 .lines .svg-sdpr-green',
  easing: 'linear',
  fill: ['rgba(0,0,0,0)', '#71bf45']
});

const logoAnimation4 = ({
  targets: '#header-graphic-1 .lines .svg-sdpr-herotext',
  easing: 'linear',
  fill: ['rgba(0,0,0,0)', '#393939']
});

const logoAnimation5 = ({
  targets: '#header-graphic-1',
  opacity: 0,
  end: () => { hideElement( $('#header-graphic-1') ) }
});

function cancelAnimation (animation) {
  let activeInstances = anime.running;
  let index = activeInstances.indexOf(animation);
  activeInstances.splice(index, 1);
}
