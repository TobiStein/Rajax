import './Home.css';
import Text from '../Letter/Text.js';
import Frame from './Frame.js';
import React from 'react';
import ScrollButton from '../ScrollButton/ScrollButton.js';
import scrollToElement from '../../scrollToElement.js';


function Josse({nextRef}){
  return(
    <div id="titre">
      <h1><Text>Josse DE OLIVEIRA</Text></h1>
      <p><Text>Étudiant en IUT Informatique</Text></p>
      <ScrollButton toFunc={()=>{
          console.log(nextRef);
          var e = nextRef.current;
          console.log(e);
          scrollToElement(e);
        }}>- Commencer -</ScrollButton>
    </div>
  );
}

class Home extends React.Component{

  render(){
    return(
      <article id="Home" ref={this.props.locateRef}>
        <Frame />
        <Josse nextRef={this.props.next} />
      </article>
    );
  }
}

export default Home;
