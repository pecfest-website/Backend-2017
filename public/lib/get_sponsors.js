function get_sponsors(id,callback)
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
        callback(result);
    });

}



module.exports.get_sponsors=get_sponsors;