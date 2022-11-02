import React from 'react';
import ParticlesBg from 'particles-bg'  
import Clarifai from "clarifai";
// import grpc from "clarifai-nodejs-grpc";

import './App.css';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank'
import { Component } from 'react';


const app = new Clarifai.App({
  apiKey: '1119f1d761c84eb0a4b03e3dcd930c95'

});

const initialState = {
  input :'',
  imageUrl:'',
  box:{},
  route: 'signin',
  isSignedIn: false,
  user:{
        id:'',
        name: '',
        email: '',
        entries:0,
        joined: ''
  }
}
class App extends Component {
  // let config = {
  //   particles:{
  //     line_linked:{
  //       shadow:{
  //         enabled: true,
  //         color: '#ffff',
  //         blur:5
  //       }
  //     }
  //   }

  // }
  constructor() {
    super();
    this.state = initialState;
  }

  // componentDidMount(){
  //   fetch('http://localhost:3000/')
  //     .then(response => response.json())
  //     .then(console.log)
  // }

  loadUser = (data) => {
    this.setState({user: {
            id:data.id,
            name: data.name,
            email: data.email,
            entries:data.entries,
            joined: data.joined
    }})

  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col*width,
      topRow: clarifaiFace.top_row*height,
      rightCol: width - (clarifaiFace.right_col*width),
      bottomRow: height - (clarifaiFace.bottom_row*height)
    }  
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box})
  }
  onInputChange = (event) => {
    this.setState({input:event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl:this.state.input})
    app.models
      // .predict(
    // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
    // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
    // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
    // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
    // is to use a different version of their model that works like the ones found here: https://github.com/Clarifai/clarifai-javascript/blob/master/src/index.js
    // so you would change from:
    // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    // to:
    .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then(response => {
      if(response){
        fetch('http://localhost:3000/image',{
          method:'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            id:this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          //Use of Object assign
          this.setState(Object.assign(this.state.user, {entries:count}))
        })
        .catch(console.log); //to catch any error
      }
      this.displayFaceBox(this.calculateFaceLocation(response))})
    .catch(err => console.log(err));

  }
  
  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    } else if(route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }
  render(){
    const {isSignedIn, imageUrl, box, route} = this.state;
  return (
    <div className="App">
      <ParticlesBg type="cobweb" 
      // color='#FFFAFA'
      // num={500}
      // config={config} 
      bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
      {route === 'home'
        ?<div>
          <Logo/>
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={box} imageUrl={imageUrl}/>
    
        </div>
        :(
          route === 'signin'
          ? 
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
        
      }
    </div>
  );
}
}
export default App;
