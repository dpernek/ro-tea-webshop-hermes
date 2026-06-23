const T=**...**st GRAPH_URL = "https://graph.microsoft.com/v1.0";

export async function sendViaGraph(p: { to: string; subject: string; html: string }): Promise<boolean> {
  const tid=process.env.MICROSOFT_TENANT_ID, cid=process.env.MICROSOFT_CLIENT_ID, cs=process.env.MICROSOFT_CLIENT_SECRET;
  const sender=process.env.MICROSOFT_SENDER_USER||"info@ro-tea.hr";
  if(!tid||!cid||!cs){console.log("[GRAPH] Missing env");return false;}
  try{
    const tr=await fetch(T+tid+"/oauth2/v2.0/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:cid,client_secret:cs,scope:"https://graph.microsoft.com/.default",grant_type:"client_credentials"}).toString()});
    const td=await tr.json();
    if(!tr.ok){console.log("[GRAPH] Token fail "+tr.status,JSON.stringify(td).slice(0,300));return false;}
    console.log("[GRAPH] Token OK expires:"+td.expires_in);
    const mr=await fetch(GRAPH_URL+"/users/"+sender+"/sendMail",{method:"POST",headers:{Authorization: *** "+td.access_token,"Content-Type":"application/json"},body:JSON.stringify({message:{subject:p.subject,body:{contentType:"HTML",content:p.html},toRecipients:[{emailAddress:{address:p.to}}]},saveToSentItems:false})});
    if(mr.status===202){console.log("[GRAPH] Sent OK");return true;}
    const et=await mr.text().catch(()=>"");
    console.log("[GRAPH] Send fail "+mr.status,et.slice(0,400));
    return false;
  }catch(e:any){console.log("[GRAPH] Exception",e.message||e);return false;}
}
