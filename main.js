// Garden[Hacked] Project from LABSOL Team

var Cylon = require('cylon');
var B = 3975;
var e = 0;
var exp =0;

// User experience functions

function calculate_experience(h) {
    var exp = 0;
    if ( h >=60 && h <= 100 ) {
        exp = 350;
    }
    return exp;
}



Cylon.robot({
  connections: {
    edison: { adaptor: 'intel-iot' },
    m2x: { adaptor: 'm2x', masterKey: '9b18886da32ba5524bb557376d996b91'}
  },
  devices: {
    m2x: { driver: 'm2x', id: '45f7fa6a0529249a6874f0025e2755ef', connection: 'm2x'},
    temp_sensor: { driver: 'analog-sensor', pin: 0, lowerLimit: -100, upperLimit: 900, connection: 'edison'},
    light_sensor: { driver: 'analog-sensor', pin: 1, lowerLimit: 0, upperLimit: 999, connection: 'edison'},
    humidity_sensor: { driver: 'analog-sensor', pin: 2, lowerLimit: -50, upperLimit: 1024, connection: 'edison'},
    screen: { driver: 'upm-jhd1313m1', connection: 'edison'},
    pump: { driver: 'direct-pin', pin: 9, connection: 'edison'},
    buzzer: { driver: 'direct-pin', pin: 2, connection: 'edison'}
  },
  work: function(my) {
    
      var f1 = false;
      var i = 0;
      var j = 0;
      setInterval(function() {
        
        
        // Temperature settings
        var a = my.temp_sensor.analogRead();
        var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
        var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
       // console.log("temp: " + parseInt(celsius_temperature));
        
        // Light Settings
        var b = my.light_sensor.analogRead();
        b = b / 5;
        //console.log("Light: " + b + "%");
        
        // Humidity Settings
        var c = my.humidity_sensor.analogRead();
        c = ((c * -1) + 780) / 5;
        
        // Set the limit to humidity
        if (c >= 100) {
            c = 100;
        }
        //console.log("Humidity: " + c);
        
        
        
        // M2X 
        my.m2x.publish("temperature", celsius_temperature, function(err, data) {
                  //console.log("Err: ", err);
                  //console.log("Values: ", data);
        });
        
        my.m2x.publish("light_sensor", b, function(err, data) {
                  //console.log("Err: ", err);
                  //console.log("Values: ", data);
        });
        
        my.m2x.publish("humidity", c, function(err, data) {
                  //console.log("Err: ", err);
                  //console.log("Values: ", data);
        });
    
        // Handle the background color of the lCD based on humidity status
        if ( c >= -5 && c <= 30 ) {
            red = 255;
            green =0;
            blue =0;
            my.screen.setColor(red,green,blue);
            my.buzzer.digitalWrite(1);
            
        } else if ( c > 31 && c < 60) {
            red = 255;
            green =204;
            blue =0;
            my.screen.setColor(red,green,blue); 
            my.buzzer.digitalWrite(0);
            
            
        } else {
            // 0, 204, 102
            red = 0;
            green =255;
            blue =0;
            my.screen.setColor(red,green,blue);  
            my.buzzer.digitalWrite(0);
        }

        console.log("##################################");

        // LCD Information  
        my.screen.setCursor(0,0);
        my.screen.write("T: " + parseInt(celsius_temperature) + " oC");
        my.screen.setCursor(1,0);
        my.screen.write("L: " + parseInt(b) + "%  H: " + parseInt(c) + "%");
        my.screen.write("                ");
        
        if (f1 === true){
            j++;
            if (j >= 5) {
                f1 = false;
                j = 0;
                console.log("j: " + j );
            }
        }
        console.log("flag: " + f1);
        if (f1 === false) {
            // Handle the timing of the water pump
            if (c <= 50) {
               console.log("c <= 50: " + c);
               my.pump.digitalWrite(1);
               i++;
            } 

            if (i >=4) {
                my.pump.digitalWrite(0);
                f1 = true;
                i = 0;
            }
        }
        // Submit Exp
        //setInterval(calculate_experience(celsius_temperature, b, c), 86400000);
        /*
          setInterval(function() {
              var this_exp = calculate_experience(celsius_temperature, b, c);
              console.log(this_exp);
              my.m2x.publish("experience", this_exp, function(err, data) {
                  //console.log("Err: ", err);
                  //console.log("Values: ", data);
              });
          }, 10000); */
        
        
        if (e >= 20) {
            k = calculate_experience(c);
            exp = exp + k;
            
            my.m2x.publish("experience", exp, function(err, data) {
                  //console.log("Err: , err);
                  //console.log("Values: ", data);
            });
            
            e = 0;
        }
        
    console.log(e);
    e++;    
    }, 1000);
   }
}).start();
