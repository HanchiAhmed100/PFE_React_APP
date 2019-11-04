import React, { Component } from 'react';

import './App.css';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBCardHeader,
  MDBBtn,
  MDBInput
} from "mdbreact";
import axios from 'axios'
import openSocket from 'socket.io-client';
import moment from 'moment'

class App extends Component {



  constructor(props){
    super(props)
    this.state = ({
      response : [],
      username: '',
      password : '',
      error :'',
      user : [],
      notloged : true, 
      next : '',
      mobile : 3,
      tmp : new Date(),
      etat : 1,

    })


  }
  componentDidMount(){

  }
  
  handelState = (name,e) => {
    this.setState({ [name]: e.target.value });
  }

  login = async () => {

    await axios.post('http://localhost:3000/Api/Auth/guichetLogin',{
      username : this.state.username,
      password : this.state.password
    }).then(response =>{

      if(response.data.failed){
        this.setState({error : response.data.failed})
      }else{
        this.setState({user : response.data.guichet , notloged : false})
      }
    })
    .catch(err =>{

    	console.log(err)
    })
    this.load()
  }


  nexxt = () =>{

    if( moment(new Date()).isBefore(moment( this.state.tmp ).add(15,'s')) ){

      this.setState({etat : 2})
  
    }else{

      this.setState({etat : 1})
    }   
    this.load()
    this.setState({tmp : new Date()})
  }

  load = () => {
    const socket = openSocket('http://localhost:3000');
    axios.post('http://localhost:3000/Api/Guichet/new',{
      agence_id : this.state.user.agence_id
    }).then(res =>{
      this.setState({resrvation : res.data.passage})

      if( res.data.passage.mobile ){
        this.setState({next : res.data.passage.mobile[0].code })
        this.setState({ mobile : 1})

        socket.emit('CODE', "M-"+res.data.passage.mobile[0].code , this.state.user.num , this.state.user.agence_id);
        
        this.setDone(res.data.passage.mobile[0].id)
      }else{
        if( res.data.passage.locale ){
        	
     	 	  this.setState({next : res.data.passage.locale[0].code}) 
          socket.emit('CODE', "L-"+res.data.passage.locale[0].code , this.state.user.num , this.state.user.agence_id);
        	this.setState({mobile : 2})  
        	this.setDone(res.data.passage.locale[0].id)

        }else{
          this.setState({next : null})
          socket.emit('CODE', "null" , this.state.user.num , this.state.user.agence_id );
          this.setState({ mobile : 3 })
        }
      }

    
    }).catch(err => {
    	this.setState({error : err})
    })
  }

  setDone = async id => {
  
    await axios.post('http://localhost:3000/Api/Guichet/next',{
      guichet_id : this.state.user.id,
      etat : this.state.etat,
      id : id
    })
    .then(res => console.log(res) )
    .catch(err => console.log(err) )
    this.setState({ tmp : new Date()})
  }

  render() {
    if(this.state.notloged){
      return (
        <MDBContainer>
        <MDBRow>
        <div className="col-sm-3"></div>
          <MDBCol md="6">
          <br/><br/> 
            <MDBCard>
              <MDBCardBody>
                <MDBCardHeader className="form-header deep-blue-gradient rounded">
                  <h3 className="my-3 text-center" style={{color:"white" }}>
                    <MDBIcon icon="lock" /> Login
                  </h3>
                </MDBCardHeader>
                <form>
                  <div className="grey-text">
                    <MDBInput
                      label="username"
                      icon="envelope"
                      group
                      type="text"
                      validate
                      error="wrong"
                      success="right"
                      value={this.state.username} 
                      onChange={(e) => this.handelState("username", e)}
                    />
                    <MDBInput
                      label="mot de passe"
                      icon="lock"
                      group
                      type="password"
                      validate
                      value={this.state.password} 
                      onChange={(e) => this.handelState("password", e)}
                    />
                  </div>
                  <div className="text-center" style={{color:'red'}}>
                    {this.state.error}                  
                  </div>
  
                <div className="text-center mt-4">
                  <MDBBtn
                  	outline 
                    color="light-blue"
                    className="mb-3"
                    onClick={this.login} 
                  >
                    Login
                  </MDBBtn>
                </div>
                </form>
  
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

      </MDBContainer>
      );
    }

    let text;
    if(this.state.mobile === 1){
      text = <span>M-{this.state.next}</span>
    }
    else if( this.state.mobile === 2){
      text = <span>L-{this.state.next}</span>
    }
    else{
    	text = <span> -- </span>
    }

    return(
     <MDBContainer>
        <MDBRow>
        <div className="col-sm-3"></div>
          <MDBCol md="6">
          <br/><br/> 
            <MDBCard>
              <MDBCardBody>
                <MDBCardHeader className="form-header deep-blue-gradient rounded">
                  <h3 className="my-3 text-center" style={{color:"white" }}>
                    Numero : {text}
                  </h3>
                </MDBCardHeader>

                  <div className="text-center mt-4">
                  <br/>
                  <br/>
                  	<h4>Guichet : {this.state.user.num}</h4>
                    <h4>Agent  :  {this.state.user.username}</h4>
                  <br/>
                  <br/>
                  <br/>


                    <MDBBtn outline color="light-blue" className="mb-3" onClick={this.nexxt}>
                      Next
                    </MDBBtn>
                    <br/>                 
                    <br/>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    )
  }
}

export default App;
