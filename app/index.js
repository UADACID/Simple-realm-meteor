import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  NetInfo,
  Platform,
} from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
import Realm from 'realm';
import _ from 'lodash';
import * as Progress from 'react-native-progress';
//Meteor.connect('wss://story.cybermantra.net/websocket');
Meteor.connect('ws://localhost:3000/websocket');
let realm = new Realm({
  schema: [{name: 'Komik', properties: {title: 'string'}}]
})
let favs = realm.objects('Komik').sorted('title')
class App extends Component {

  constructor () {
    super()
    this.arr = [];
    this.state = {
      connect: false,
      limit:1
    }
  }

  componentDidMount(){

      Meteor.ddp.on("added", message => {
        realm.write(() => {
          //realm.delete(realm.objects('Komik'))
          //const fetchId = message.id
          let komiks = realm.objects('Komik').filtered('title= $0',message.id)
          if (komiks.length === 0) {
            realm.create('Komik', { title: message.id })
          }
          // console.log(komiks.length);
          // console.log(;
        })
      })
  }

  hapusData(id){
    realm.write(()=>{
      //const id = 'PratamaaMBjcMXfe'
      realm.delete(realm.objects('Komik').filtered('title= $0',id))
    })
  }

  tampilAllData(){
    const a = realm.objects('Komik')
    a.map((x)=>{
      return(
        console.log(x.title)
      )
    })
  }

  render(){
    NetInfo.isConnected.fetch().done(
        (isConnected) => {
          if (isConnected) {
            this.setState({connect:true})
          }else{
            this.setState({connect:false})
          }
        }
    );
    const {connect} = this.state
    let dataKomik = _.map(favs.slice(0, 50), (f, i) => {
      return (
        <View key={i}>
        <TouchableHighlight onPress={()=>this.hapusData(f.title)}>
          <Text>
          {f.title}
          </Text>
        </TouchableHighlight>
        </View>
        )
    })
    let nums = realm.objects('Komik').length;
    return(
      <View style={styles.container}>
      <TouchableHighlight onPress={()=>this.tampilAllData()}>
        <Text style={{marginTop:30}}>
          hallo
        </Text>
      </TouchableHighlight>

      <ScrollView>
      {dataKomik}
      </ScrollView>
      {connect? <View/> : <Progress.Circle size={30} indeterminate={true} />}
      <View>
       <Text>
       {nums}
       </Text>
      </View>

      </View>
    )
  }
}

export default createContainer(params=>{
  const handle = Meteor.subscribe('komiks',{},{limit:100});

  return {
    //ready: handle.ready(),
    komik: Meteor.collection('komiks').find()
  };
}, App)

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  }
})
