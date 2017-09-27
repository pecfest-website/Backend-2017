function save_profile(id,callback)
{
	
var query='select exists(
  select * from table_name where id=id" 
   )';
 console.log(query);
    client.query(query,function (err,result) {
        if(err)
        {
            callback({"success"="false"});
        }
        callback({"success"="true"});
    });

}



module.exports.save_profile=save_profile;