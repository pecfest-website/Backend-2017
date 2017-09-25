var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
// var users = require('./routes/users');
var postGresClient = require('./public/lib/PostGresqlConnect');
var client = postGresClient.getpostGresqlClient();
var checkUserAuth = require('./public/lib/checkUserAuthentication');
var fetch=require('./public/lib/fetchdata');
var sync=require('./public/lib/sync');
var create_main_table=require('./public/lib/create_main_table');
// var HashMap = require('hashmap');
var multimap=require('multimap');
var create_repeat_table=require('./public/lib/create_repeat_table');
var fetch_questionlist=require('./public/lib/fetch_questionlist_for_insertion');
var insert=require('./public/lib/insert_values');

var synData = require('./public/lib/syncData');

var app = express();


// view engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/users', users);

// app.post('/checkAuth',function (req,res) {

//     req = req.body;
//     console.log("test");
//     //checkUserAuth.checkUserAuthentication(req,client,function onComplete(result) {
//        // res.json(result);
//     //})
// res.json({success:true});
// });


app.post('/fetchquestion',function(req,res){

 var id=req.body.sub;
 //var id="d4cdec85-e2e2-4d68-a554-e4dbb18f0b69";
   // console.log(req.body);
   var data=[];

    fetch.fetchquestion(id,client,function onComplete(value) {
      //  console.log(value);
       
        for(var i in value.rows)
        {
            data.push([value.rows[i].question,value.rows[i].Anomaly,value.rows[i].Cascade]);
        }
         res.json(data);

    });
});
app.post('/download',function(req,res){

    res.json(resume.pdf);
})

app.post('/sync',function(req,res){

    // variable to store survey name
    var name;

    // Unique id of a user
    var id=req.body.sub;
    console.log(req.body.survey);

    // Fetching list of surveys of a particular user
    fetch.fetchlist(req,res,id,client,function Complete(value){
        name=value.rows[0].Survey_list[0].Survey_Name;                         // Survey Name

    fetch.fetchquestion(req,res,id,client,function onComplete(value) {
        var datatype = [];   // array to store the datatypes of columns present in the parent table
        var question=[];
        var Index=[];


        for(var i in value.rows[0].question)                  // loop iterating over all the questions of the survey
        {

            if(value.rows[0].question[i].Repeat_Dependence==null)  // checking if the column will be in the parent table or not
            {
                datatype.push(value.rows[0].question[i].Question_Type);
                question.push(value.rows[0].question[i].Question);
                Index.push(value.rows[0].question[i].Question_Number);
                if(value.rows[0].question[i].Repeater==true)              // checking if the repeater is true for the particular question
                {
                    var array=[];                                         // array to store the Question numbers of questions that are to be repeated
                    var questions=[];
                    var type=[];
                    array=value.rows[0].question[i].Question_repeat;
                    var index=[];
                    for(var j in array)
                    {
                        array[j]=array[j]-1;
                        index.push(value.rows[0].question[array[j]].Question_Number);

                    }
                    for(var j in array)
                    {

                        questions.push(value.rows[0].question[array[j]].Question);

                    }
                    for(var j in array )               // Loop to determine the data types for the columns in the table
                    {
                        array[j]=array[j]-1;
                        if(value.rows[0].question[array[j]].Question_Type=='Subjective'||value.rows[0].question[array[j]].Question_Type=='Radio'||value.rows[0].question[array[j]].Question_Type=='Calendar'||value.rows[0].question[array[j]].Question_Type=='Picture_Input'||value.rows[0].question[array[j]].Question_Type=='Map')
                        {   type.push('text'); }
                        else if(value.rows[0].question[array[j]].Question_Type=='Button'||value.rows[0].question[array[j]].Question_Type=='Checkbox'||value.rows[0].question[array[j]].Question_Type=='Selected Dropdown')
                        {
                            type.push('text');
                        }
                        else
                        {
                            type.push('text');
                        }

                    }

                    var t_name=name+'.'+value.rows[0].question[i].Question_Number;   // Giving table name to sub tables
                    create_repeat_table.create_repeat_table(client,index,type,questions,array,t_name,function onComplete(result){

                        console.log("Table created");                  // assign proper output
                    });

                }
            }

            if(value.rows[0].question[i].Repeater==true&&value.rows[0].question[i].Repeat_Dependence!=null)
            {
                var array=[];
                array=value.rows[0].question[i].Question_repeat;
                var index=[];
                var type=[];
                var questions=[];
                for(var j in array)
                {
                    array[j]=array[j]-1;
                    index.push(value.rows[0].question[array[j]].Question_Number);

                }
                for(var j in array)
                {
                    questions.push(value.rows[0].question[array[j]].Question);

                }
                for(var j in array)
                {
                    array[j]=array[j]-1;
                    if(value.rows[0].question[array[j]].Question_Type=='Subjective'||value.rows[0].question[array[j]].Question_Type=='Radio'||value.rows[0].question[array[j]].Question_Type=='Calendar'||value.rows[0].question[array[j]].Question_Type=='Picture_Input'||value.rows[0].question[array[j]].Question_Type=='Map')
                    {   type.push('text'); }
                    else if(value.rows[0].question[array[j]].Question_Type=='Button'||value.rows[0].question[array[j]].Question_Type=='Checkbox'||value.rows[0].question[array[j]].Question_Type=='Selected Dropdown')
                    {
                        type.push('text');
                    }
                    else
                    {
                        type.push('text');
                    }

                }

                var t_name=name+'.'+value.rows[0].question[i].Question_Number;
                create_repeat_table.create_repeat_table(client,index,type,questions,array,t_name,function onComplete(result){

                    console.log("created");});


            }


        }
// Creating main table now, at this stage all the subtables have been created
        var type=[];
        for( var i in datatype)
        {

            if(datatype[i]=='Subjective'||datatype[i]=='Radio'||datatype[i]=='Calendar'||datatype[i]=='Picture Input'||datatype[i]=='Map')
            {
                type.push('text');
            }
            else if(datatype[i]=='Selected Dropdown'||datatype[i]=='Checkbox'||datatype[i]=='Button')
            {
                type.push('text');
            }
            else
                type.push('text');

        }

// At this stage , all the tables have been created. Now insertion of values will take place



        create_main_table.create_main_table(client,type,name,question,Index,function onComplete(result){
            fetch_questionlist.fetch_questionlist_for_insertion(client,function onComplete(result){

                var survey=JSON.parse(req.body.survey);
                var main_question=[];
                var main_answer=[];

                var answers=survey.question;
                var questions=(result.rows[0].question);


//  for(var i in questions)
//  { 

//   var temp=[];

// if(questions[i].Question_Type=='Checkbox')
// {
//    for(var j in answers[(questions[i].Question_Number)-1])
//    {
//     if(answers[(questions[i].Question_Number)-1][j]==true)
//     {
//          temp.push(questions[i].Option_names[j]);
//     }
//    }
//    answers[(questions[i].Question_Number)-1]=temp;

// }









//  }
                var extras=[];
                extras.push(survey.surveyTime);
                extras.push(survey.userName);
                extras.push(survey.syncTime);
                extras.push(survey.updatedTime);
                extras.push(survey.surveyType);

                var final_column_list=[];
                var table_name=survey.surveyType;


                for(var i in questions)
                {  var repeater_answer=[];

                    if(questions[i].Repeat_Dependence==null)
                    {
                        final_column_list.push(questions[i].Question_Number);
                        main_question.push(questions[i].Question_Number);
                        main_answer=answers[questions[i].Question_Number-1];
                        var k=main_answer;
                        if(questions[i].Repeater==true&&answers[(questions[i].Question_Number)-1]>0)
                        {
                            var  repeater_array=questions[i].Question_repeat;

                            while(k--)
                            {
                                var sub_type=[];
                                for(var j in repeater_array)
                                {
                                    repeater_answer.push(answers[(repeater_array[j])-1][k]);
                                    sub_type.push( questions[repeater_array[j]-1].Question_Type);
                                }

                                insert.insert_values_subtable(survey.userName,(questions[i].Question_Number),repeater_array,sub_type,table_name,repeater_answer,client);
                            }
                        }
                        continue;

                    }
                    if(questions[i].Repeater==true)
                    {

                        repeater_array=questions[i].Question_repeat;
                        var k=answers[(question[i].Question_Number)-1];
                        if(k==0)
                            continue;
                        while(k--)
                        {
                            var sub_type=[];
                            for(var j in repeater_array)
                            {
                                repeater_answer.push(answers[(repeater_array[j])-1][k]);
                                sub_type.push( questions[repeater_array[j]-1].Question_Type);
                            }

                            insert.insert_values_subtable(survey.userName,questions[i].Question_Number,repeater_array,sub_type,table_name,repeater_answer,client);

                        }

                    }
                }

                insert.insert_values_maintable(final_column_list,type,table_name,answers,extras,client,function onComplete(result)
                {
                res.json({"success":"true"});
                });

//ends here
            });

        });

    });

    });
    res.json({"success":"true"});
});

app.post('/fetchlist',function(req,res){
   var id=req.body.sub;
   // var id="d4cdec85-e2e2-4d68-a554-e4dbb18f0b69";
    // console.log(req.body);
    var list=[];
    fetch.fetchlist(id,client,function onComplete(value) {
       //  res.json(value.rows[1].Survey_list);
         for(var i in value.rows)
         {
            list.push(value.rows[i].Survey_list[0]);

         }
         res.json(list);

    });
});

app.post('/syncData',function (req,res) {

    synData.syncData(req,client,function onComplete(result) {

        res.json(result);
    });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;
