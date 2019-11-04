import React, { Component } from 'react';

class slema extends Component{
 
    constructor(props){
        super(props)
        this.state = ({
            name : '',
            count : 0,
            m : '',
            loading : true,
            error : ''
        })
    }

    btn =  () => {
        let x = this.state.count 
        x ++
        this.setState({
            count : x,
            loading : false
        })
        
    }

    changed = (x,e) =>{
        this.setState({ [x]: e.target.value });
    }

    async componentDidMount(){

    }


    render(){
        if( this.state.loading ){
            return(
                <div>
                    loading
                    <button onClick={this.btn}> valider </button>
                </div>
            )
        }
        return(
            <div>
                <h2> heloo from {this.state.name} componenet</h2>
                <input type="text"  onChange={(e) => this.changed("name", e)} />

                {this.state.count}
                <h2>{this.props.nom}</h2>

            </div>
        )
    }

}
export default slema;
