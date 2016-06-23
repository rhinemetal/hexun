$(function(){
	//资金流向 浮层
	$("#zjlx_show").hover(function(event){
		$(this).siblings("div").show();
	},function(){
		$(this).siblings("div").hide();
	});
	//我的肌票登录
	$(".pp .in,.graphic .tip .in").focus(function(){
		$(this).addClass("s");
		if($(this).val() ==this.defaultValue){
			$(this).val("");
		}
	}).blur(function(){
		$(this).removeClass("s");
		if ($(this).val() == '') {
			$(this).val(this.defaultValue);
		}
	});
	$(".mystock-tit li").click(function(){
		$(this).addClass("s").siblings().removeClass("s");
		var index =  $(".mystock-tit li").index(this);
		$(".mystock-con > div").eq(index).show().siblings().hide();
	});
	//印象
	$(".yx .m").toggle(function(){
		$(this).addClass("m-down");
		$(".yx ul").css({"height":"auto"});
	},function(){
		$(this).removeClass("m-down");
		$(".yx ul").css({"height":"87px"});
	});
	//推荐关注
	$(".tjgz-m").click(function(event){
		if ($(".tjgz").height() < 1195){
			$(".tjgz").height($(".tjgz").height() + 240);
		}else {
			$(".tjgz").css({"height":"235px"});;
			$(this).removeClass("tjgz-m-down");
			$(this).addClass("tjgz-m-up");
		}
		if ($(".tjgz").height() == 1195){
			$(this).addClass("tjgz-m-down");
		}
	});
	//滑动tab
	$(".sctock_tab li").click(function(event){
		$(this).addClass("s").siblings().removeClass("s");
	});
	//$('#sctock_tab_2,#sctock_tab_3,#sctock_tab_4,#sctock_tab_5,#sctock_tab_6,#sctock_tab_7,#sctock_tab_8,#sctock_tab_9,#sctock_tab_10').jcarousel({scroll:1});
	//相关排名
	$('#xgpm_data').jcarousel({scroll:4});
	//数据表格列变色--垂直
	$(".tdv thead th").mousemove(function(event){
		$(this).addClass("s").siblings("th").removeClass("s");
		$(this).parents("thead").siblings().find("td:nth-child(" + ($(this).index()+1) + ")").addClass("s").siblings().removeClass("s");
	});
	//数据表格列变色--水平
	$(".tdh tbody tr").hover(function(event){
		$(this).children("th").addClass("s");
		$(this).children("td").addClass("s");
	},function(){
		$(this).parents("table").find("th").removeClass("s");
		$(this).parents("table").find("td").removeClass("s");
	});
	//数据表格行变色--推荐的关注、热门股票(右侧)
	$(function(){
		$(".data7 tr,.data_hot tr").hover(function(event){
			$(this).find("td,img").addClass("s");
		},function(){
			$(this).find("td,img").removeClass("s");
		});
	});
	$(".data7 tr,.data_hot tr").live('mouseover mouseout', function(event) {
		if (event.type == 'mouseover') {
				$(this).find("td,img").addClass("s");
		} else {
				$(this).find("td,img").removeClass("s");
		}
	});
	//数据表格列变色--*基本分析
	$(".data3th th").each(function (i) {
		$(this).mousemove(function(event){
			$(this).addClass("s").siblings("th").removeClass("s");
			$(".data3 tr").find("td:nth-child(" + (i+3) + ")").addClass("s").siblings().removeClass("s");
		});
	});
	//左侧三级菜单
	$(".more").hover(function(event){
		$(this).children("div").show();
	},function(){
		$(this).children("div").hide();
	});
	//左侧菜单折叠
	$(".stockl dt").click(function(event){
		if ($(this).siblings("dd").css("display") == "block"){
			$(this).css({"background":"url(images/arr_9x5b.png) #E4EEF7 12px 9px no-repeat"});
			$(this).siblings("dd").hide();
		}else {
			$(this).css({"background":"url(images/arr_9x5a.png) #E4EEF7 10px 11px no-repeat"});
			$(this).siblings("dd").show();
		}
	});
	//左侧菜单隐藏域
	$(".more").hover(function(event){
		$(this).css({"background-color":"#E4EEF7"});
	},function(){
		$(this).css({"background-color":"#FBFBFB"});
	});
	//相关排名按钮箭头
//	$(".xgpm_o .jcarousel-container").append('<div class="box_l"></div><div class="box_r"></div>');
	$(".xgpm_o .jcarousel-container").append('<img src="images/arr_9x5e.png" style="position:absolute;top:88px;left:5px" />');
	$(".xgpm_o .jcarousel-container").append('<img src="images/arr_9x5f.png" style="position:absolute;top:88px;right:5px" />');
});


function tab(name,cursel,n){
	for(var i=1;i<=n;i++){
		var menu=document.getElementById(name+i);
		var con=document.getElementById("con_"+name+"_"+i);
		//menu.className=i==cursel?"s":"";
		con.style.display=i==cursel?"block":"none";
	}
}
//iframe
function setIframe(i,e,h,f){
	var i = document.getElementById(i);
	i.src = e;
	i.style.display = "block";
	i.style.height = h + "px";
	document.getElementById(f).style.display = "none";
}
function reIframe(i,f){
	document.getElementById(i).style.display = "none";
	document.getElementById(f).style.display = "block";
}

//截取url,获取肌票代码
//var strurl = (window.location.href).split("/");
//var indexcode = strurl[4].split(".")[0];
//var indexcode = hqxx_code;

//操作对象
var zsg  = document.getElementById("zs_stock_topbn");
var yx   = $(".yx ul");
var q_state = document.getElementById("q_state");
var k ;



//判断登录
function getLoginInfo(){
	$.ajax({
		type:"GET",
		dataType:"jsonp",
		url:"http://reg.tool.hexun.com/wapreg/checklogin.aspx?format=json",
		async : false,
		success:function(data){
			stockSelfSuccess(data);
		}
	});
	function stockSelfSuccess(data){
		if(data.islogin=="True"){
			window.userID = data.userid;
			$(".pp").hide();
			myStock();//调用我的自选股
			setInterval('myStock()',10000)
			//topAddStock();//顶部添加自选股
			latelyVisit();//最近访问股
			setInterval('latelyVisit()',10000);
		}else{
			hotStockData(10);//调用热门股
			setInterval('hotStockData(10)',10000);
		}
	}
}

//股票关注数
function zxgTotal(){
	$.ajax({ 
		type: "GET",
		url: "http://mymoney.tool.hexun.com/2012/interface/StockUtils.ashx?stockcode=600519",
		dataType: "jsonp",
		success : function(data){
			$(zsg).children("em").html(data.result);
		}	
	}); 
}

//我的自选股
function myStock(){
	var myStockHtml = '<table><col width="90px"><col width="50px"><col width="56px">';
	$.ajax({ 
		type: "GET",
		url: "http://mymoney.tool.hexun.com/2012/interFace/Js_MystockForToolBar.aspx?userID="+userID,
		dataType: "jsonp",
		success : function(data){
			if (!data){
				hotStockData(10);
				setInterval('hotStockData(10)',10000);
			}else{
				for (i = 0; i < data.list.length; i++){
					if (data.list.length < 10){hotStockData(10-data.list.length)}
					if (data.list[i].priceRate > 0){
						myStockHtml += '<tr><td><a href="'+data.list[i].stockLink+'" target="_blank" class="unl">'+data.list[i].name+'</a></td><td class="tr"><span class="color_900">'+data.list[i].price+'</span></td><td class="tr"><span class="color_900">'+data.list[i].percentRate+'</span></td></tr>';
					}else if (data.list[i].priceRate < 0){
						myStockHtml += '<tr><td><a href="'+data.list[i].stockLink+'" target="_blank" class="unl">'+data.list[i].name+'</a></td><td class="tr"><span class="color_090">'+data.list[i].price+'</span></td><td class="tr"><span class="color_090">'+data.list[i].percentRate+'</span></td></tr>';
					}else{
						myStockHtml += '<tr><td><a href="'+data.list[i].stockLink+'" target="_blank" class="unl">'+data.list[i].name+'</a></td><td class="tr"><span>'+data.list[i].price+'</span></td><td class="tr"><span>'+data.list[i].percentRate+'</span></td></tr>';
					}
					if (i >= 9 ){
						$("#hotstockTit,#hotstock,#hotstockTit_line,#latelyVisit_line").hide();
						break;
					}
				}
				myStockHtml += '</table>';
				$('#mystock').html(myStockHtml);
			}
		}
	}); 
}


function timeS(){
	var tagDate = new Date();
	var tagDay  = tagDate.getDay(); 
	var tagHour = tagDate.getHours();
	var tagMin  = tagDate.getMinutes(); 
	if(tagDay !=6 && tagDay !=0){
		if (tagHour >=9 && tagHour <15){
			if (tagHour ==9 && tagMin <15){
				q_state.innerHTML = "未交易";
			}else	if(tagHour ==11 && tagMin >30 || tagHour ==12){
				q_state.innerHTML = "午间休市";
			}else{
				q_state.innerHTML = "交易中";
			}
		}else {
				q_state.innerHTML = "未交易";
		}
	}else{
				q_state.innerHTML = "已休市";
	}
} 

var tagTime = setTimeout(timeX,6000);
/*
function timeX(){
	clearTimeout(tagTime);
	var tagDate = new Date();
	var tagDay  = tagDate.getDay(); 
	var tagHour = tagDate.getHours();
	var tagMin  = tagDate.getMinutes(); 
	tagTime = setTimeout(timeX,6000); 
	if(tagDay !=6 && tagDay !=0){
		if (tagHour >=9 && tagHour <15){
			if (tagHour ==9 && tagMin <15){
				q_state.innerHTML = "未交易";
			}else	if(tagHour ==11 && tagMin >30 || tagHour ==12){
				q_state.innerHTML = "午间休市";
			}else{
				q_state.innerHTML = "交易中";
				hqxxData(hqxx_code);
				xgzqData(xgzq_Hcode,xgzq_Acode);
			}
		}else {
			if (tagHour ==15 && tagMin <=1){
				hqxxData(hqxx_code);
				xgzqData(xgzq_Hcode,xgzq_Acode);
			}
			q_state.innerHTML = "未交易";
		}
	}else{
				q_state.innerHTML = "已休市";
	}
} 
*/

function timeX(){
	clearTimeout(tagTime);
	tagTime = setTimeout(timeX,6000); 
	//hqxxData(hqxx_code);
	xgzqData(xgzq_Hcode,xgzq_Acode);
} 


function toDecimal(x) {
	var f = parseFloat(x);  
	if (isNaN(f)){  
		return;  
	}  
	f = Math.round(x*100)/100;  
	return f;  
}
function toDecimal2(x) {  
	var f = parseFloat(x);
	if (isNaN(f)){
		return false;
	}  
	var f = Math.round(x*100)/100;
	var s = f.toString();
	var rs = s.indexOf('.'); 
	if (rs < 0){
		rs = s.length;
		s += '.';
	}
	while (s.length <= rs + 2){
		s += '0';  
	}
	return s;
}



//行情信息 请求数据
function hqxxData(hqxx_code){
	$.ajax({
	  type: "GET",
//																																			0			1			2			3				4					5				6				7				8				9					10			11	12		13			14		15				16					17						18						19			20		21				22
		url: "http://webstock.quote.hermes.hexun.com/gb/a/quotelist?column=Code,Name,Price,Updown,UpdownRate,DateTime,High,LastClose,Volume,OutVolume,TotalPrice,Low,Open,Amount,InVolume,PE2,ExchangeRatio,VolumeRatio,VibrationRatio,EntrustRatio,PB,AvePrice,LastVolume",
		data: {code:hqxx_code},
	  dataType: "jsonp",
	  success : function(data){
			$("#q_sname").html("<a href='http://stockdata.stock.hexun.com/"+data.Data[0][0][0]+".shtml'>"+data.Data[0][0][1]+"</a>");
			$("#q_scode").html(data.Data[0][0][0]);
			$("#q_current").html(toDecimal2(data.Data[0][0][2]/100,2));
			$("#q_updownprice").html(toDecimal2(data.Data[0][0][3]/100));
			$("#q_upDownRate").html("(" + toDecimal2(data.Data[0][0][4]/100) + "%)");
			var q_timeT = data.Data[0][0][5].toString().replace(/\d{2}/g,function(o,i){return o+[""," ","-"," ",":",":",""][i/2]});
			$("#q_time").html(q_timeT.substring(0,q_timeT.lastIndexOf(':')));
			if (data.Data[0][0][3] > 0){
				$("#q_current,#q_updownprice,#q_upDownRate").attr("class","red");
				$("#q_zg,#q_zd,#q_jk").attr("class","color_900");
			} else if (data.Data[0][0][3] < 0){
				$("#q_current,#q_updownprice,#q_upDownRate").attr("class","green");
				$("#q_zg,#q_zd,#q_jk").attr("class","color_090");

			} else if (data.Data[0][0][3] == 0){
				$("#q_current,#q_updownprice,#q_upDownRate").attr("class","black");
				$("#q_zg,#q_zd,#q_jk").attr("class","");
			}
			$("#q_zg").html(toDecimal2(data.Data[0][0][6]/100,2));
			$("#q_zs").html(toDecimal2(data.Data[0][0][7]/100,2));
			$("#q_jj").html(toDecimal2(data.Data[0][0][21]/100,2));
			$("#q_cjl").html(data.Data[0][0][8]/100);
			$("#q_wp").html(data.Data[0][0][9]/100);
			$("#q_zsz").html(toDecimal(data.Data[0][0][10]/10000000000,2) + "亿");
			$("#q_zd").html(toDecimal2(data.Data[0][0][11]/100,2));
			$("#q_jk").html(toDecimal2(data.Data[0][0][12]/100,2));
			$("#q_xs").html(data.Data[0][0][22] + "手");
			$("#q_cje").html(toDecimal(data.Data[0][0][13]/10000,2) + "万");
			$("#q_np").html(data.Data[0][0][14]/100);
			$("#q_syl").html(data.Data[0][0][15]/100);
			$("#q_hs").html(toDecimal2(data.Data[0][0][16]/100,2) + "%");
			$("#q_lb").html(data.Data[0][0][17]/100);
			$("#q_zf").html(toDecimal2(data.Data[0][0][18]/100,2) + "%");
			$("#q_wb").html(toDecimal2(data.Data[0][0][19]/100,2) + "%");
			if (data.Data[0][0][19] > 0){
				$("#q_wb").attr("class","color_900");
			} else if (data.Data[0][0][19] < 0){
				$("#q_wb").attr("class","color_090");

			} else if (data.Data[0][0][19] == 0){
				$("#q_wb").attr("class","");
			}
			$("#q_sjl").html(data.Data[0][0][20]/100);
		}	
	}); 
};

//相关证券 请求数据
function xgzqData(xgzq_Hcode,xgzq_Acode){
	$('#xgzq_data1,#xgzq_data2,#xgzq_data3').html("");
	if (xgzq_Hcode==""){$('#xgzq_data1').hide()};
	if (xgzq_Acode==""){$('#xgzq_data2').hide()};
	if (block_code==""){$('#xgzq_data3').hide()};

	var xgzqhtml1 = '';
	var xgzqhtml2 = '';
	var xgzqhtml3 = '';
	
	//港股
	$.ajax({ 
	  type: "GET",
	  url: "http://webhkstock.quote.hermes.hexun.com/gb/hk/quotelist?code="+ xgzq_Hcode +"&column=Code,Name,UpdownRate",
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.Data[0], function(i){
				if (data.Data[0][i][2] > 0){
					xgzqhtml1 += '<li class="pr20"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span class="color_900">' + data.Data[0][i][2]/100 +'%</span>' + '</li>';
				}else if(data.Data[0][i][2] < 0) {
					xgzqhtml1 += '<li class="pr20"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span class="color_090">' + data.Data[0][i][2]/100 +'%</span>' + '</li>';
				}else{
					xgzqhtml1 += '<li class="pr20"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span>' + data.Data[0][i][2]/100 +'%</span>' + '</li>';
				}
			})
			$('#xgzq_data1').html(xgzqhtml1);
		}	
	}); 
	
	//债券
	$.ajax({ 
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/gb/a/quotelist?code="+ xgzq_Acode +"&column=Code,Name,UpdownRate",
	  dataType: "jsonp",
	  success : function(data){
			var urlType = xgzq_AType.split(",")
			$.each(data.Data[0], function(i){
				if (data.Data[0][i][2] > 0){
					xgzqhtml2 += '<li class="pr20"><a href="'+ BondType(urlType[i]) + data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span class="color_900">' + data.Data[0][i][2]/100 +'%</span>' + '</li>';
				}else if(data.Data[0][i][2] < 0){
					xgzqhtml2 += '<li class="pr20"><a href="'+ BondType(urlType[i]) + data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span class="color_090">' + data.Data[0][i][2]/100 +'%</span>' + '</li>';
				}else{
					xgzqhtml2 += '<li class="pr20"><a href="'+ BondType(urlType[i]) + data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span>' + data.Data[0][i][2]/100 +'%</span>' + '</li>';
				}
			})
			$('#xgzq_data2').html(xgzqhtml2);
		}	
	}); 

	//A股
	$.ajax({ 
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/gb/a/sortlist?block="+block_code+"&title=15&commodityid=0&direction=2&start=0&number=10&column=code,name,price,updownrate",
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.Data[0], function(i){
				if (data.Data[0][i][3] > 0){
					xgzqhtml3 += '<li class="pr20"><a href="http://stockdata.stock.hexun.com/'+ data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span class="color_900">' + data.Data[0][i][3]/100 +'%</span></li>';
				}else if(data.Data[0][i][3] < 0){
					xgzqhtml3 += '<li class="pr20"><a href="http://stockdata.stock.hexun.com/'+ data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span class="color_090">' + data.Data[0][i][3]/100 +'%</span></li>';
				}else{
					xgzqhtml3 += '<li class="pr20"><a href="http://stockdata.stock.hexun.com/'+ data.Data[0][i][0] +'.shtml" target="_blank" class="pr5 unl">'+ data.Data[0][i][1] + '</a><span>' + data.Data[0][i][3]/100 +'%</span></li>';
				}
			})
			$('#xgzq_data3').html(xgzqhtml3);
		}	
	}); 

};

//判断债券类型
function BondType(e){
	var urlText = "";  
	switch (e) {  
		case "0" :  //A股
			urlText += "http://stockdata.stock.hexun.com/";  
			break;  
		case "7" :  //国债
			urlText += "http://bond.money.hexun.com/treasury_bond/";  
			break;  
		case "8" :  //转债
			urlText += "http://bond.money.hexun.com/convertible_bond/";  
			break;  
		case "9" :  //企业债
			urlText += "http://bond.money.hexun.com/corporate_bond/";  
			break;  
	}  
	return urlText;
}


//热门股票
function hotStockData(sum){
	var hotStockHtml = '<table class="data_hot"><col width="90px"><col width="50px"><col width="56px">';
	$.ajax({ 
	  type: "GET",
	  url: "http://mymoney.tool.hexun.com/2012/interFace/StockRankJson.aspx?ranktype=1&pagesize="+sum,
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.result, function(i){
				if ((parseFloat(data.result[i].priceUpDownRate)/100) > 0){
					hotStockHtml += '<tr><td><a href="'+data.result[i].stockLink+'" target="_blank" class="unl">'+data.result[i].stockName+'</a><img src="images/icon_05.png" mtype="1" code="'+data.result[i].Code+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span class="color_900">'+data.result[i].price+'</span></td><td class="tr"><span class="color_900">'+data.result[i].priceUpDownRate+'</span></td><td></td></tr>';
				}else if((parseFloat(data.result[i].priceUpDownRate)/100) < 0){
					hotStockHtml += '<tr><td><a href="'+data.result[i].stockLink+'" target="_blank" class="unl">'+data.result[i].stockName+'</a><img src="images/icon_05.png" mtype="1" code="'+data.result[i].Code+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span class="color_090">'+data.result[i].price+'</span></td><td class="tr"><span class="color_090">'+data.result[i].priceUpDownRate+'</span></td><td></td></tr>';
				}else if((parseFloat(data.result[i].priceUpDownRate)/100) == 0){
					hotStockHtml += '<tr><td><a href="'+data.result[i].stockLink+'" target="_blank" class="unl">'+data.result[i].stockName+'</a><img src="images/icon_05.png" mtype="1" code="'+data.result[i].Code+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span>'+data.result[i].price+'</span></td><td class="tr"><span>'+data.result[i].priceUpDownRate+'</span></td><td></td></tr>';
				}
			});
			hotStockHtml += '</table>';
			$('#hotstock').html(hotStockHtml);
		}	
	}); 
};

//为你推荐的关注
function tjgzStockData(){
	var tjgzStockHtml = '<table class="data7"><col width="90px"><col width="50px"><col width="56px"><col width="33px">';
	$.ajax({ 
	  type: "GET",
	  url: "http://mymoney.tool.hexun.com/2012/interFace/GetAlsoAttention.aspx?stockcode="+tjgz_code,
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.result, function(i){
				if (data.result[i].priceUpDown > 0){
					tjgzStockHtml += '<tr><td><a href="'+data.result[i].stockLink+'" target="_blank" class="unl">'+data.result[i].stockName+'</a><img src="images/icon_05.png" mtype="1" code="'+data.result[i].Code+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span class="color_900">'+data.result[i].price+'</span></td><td class="tr"><span class="color_900">'+data.result[i].priceUpDownRate+'</span></td></tr>';
				}else if (data.result[i].priceUpDown < 0){
					tjgzStockHtml += '<tr><td><a href="'+data.result[i].stockLink+'" target="_blank" class="unl">'+data.result[i].stockName+'</a><img src="images/icon_05.png" mtype="1" code="'+data.result[i].Code+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span class=" color_090">'+data.result[i].price+'</span></td><td class="tr"><span class="color_090">'+data.result[i].priceUpDownRate+'</span></td></tr>';
				}else{
					tjgzStockHtml += '<tr><td><a href="'+data.result[i].stockLink+'" target="_blank" class="unl">'+data.result[i].stockName+'</a><img src="images/icon_05.png" mtype="1" code="'+data.result[i].Code+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span>'+data.result[i].price+'</span></td><td class="tr"><span>'+data.result[i].priceUpDownRate+'</span></td></tr>';
				}
			});
			tjgzStockHtml += '</table>';
			$('#tjgzstock').html(tjgzStockHtml);
		}	
	}); 
};


//最近访问股
function latelyVisit(){
	if (zjfg_code.length !=0){
		$("#zjfgNull").hide();
		var zjfwStockHtml = '<colgroup><col width="90px"><col width="50px"><col width="56px"></colgroup>';
		$.ajax({ 
			type: "GET",
			url:"http://webstock.quote.hermes.hexun.com/gb/a/quotelist?code="+zjfg_code+"&column=code,name,price,UpdownRate",
			dataType: "jsonp",
			success : function(data){
				$.each(data.Data[0], function(i){
					if (data.Data[0][i][3]/100 > 0){
						zjfwStockHtml += '<tr><td><a href="http://stockdata.stock.hexun.com/'+data.Data[0][i][0]+'.shtml" target="_blank" class="unl">'+data.Data[0][i][1]+'</a><img src="images/icon_05.png" mtype="1" code="'+data.Data[0][i][0]+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span class="color_900">'+data.Data[0][i][2] /100+'</span></td><td class="tr"><span class="color_900">'+data.Data[0][i][3] /100+'%</span></td><td class="tc"><a href="http://t.hexun.com/g/'+data.Data[0][i][0]+'_1.html" target="_blank"><em class="wb"></em></a></td></tr>';
					}else if(data.Data[0][i][3]/100 < 0){
						zjfwStockHtml += '<tr><td><a href="http://stockdata.stock.hexun.com/'+data.Data[0][i][0]+'.shtml" target="_blank" class="unl">'+data.Data[0][i][1]+'</a><img src="images/icon_05.png" mtype="1" code="'+data.Data[0][i][0]+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span class="color_090">'+data.Data[0][i][2] /100+'</span></td><td class="tr"><span class="color_090">'+data.Data[0][i][3] /100+'%</span></td><td class="tc"><a href="http://t.hexun.com/g/'+data.Data[0][i][0]+'_1.html" target="_blank"><em class="wb"></em></a></td></tr>';
					}else if(data.Data[0][i][3]/100 == 0){
						zjfwStockHtml += '<tr><td><a href="http://stockdata.stock.hexun.com/'+data.Data[0][i][0]+'.shtml" target="_blank" class="unl">'+data.Data[0][i][1]+'</a><img src="images/icon_05.png" mtype="1" code="'+data.Data[0][i][0]+'" onclick="addIStock(this)" class="ml5" alt=""></td><td class="tr"><span>'+data.Data[0][i][2] /100+'</span></td><td class="tr"><span>'+data.Data[0][i][3] /100+'%</span></td><td class="tc"><a href="http://t.hexun.com/g/'+data.Data[0][i][0]+'_1.html" target="_blank"><em class="wb"></em></a></td></tr>';
					}
				});
				$('#latelyVisit').html(zjfwStockHtml);
			}	
		}); 
	}
}


//印象 请求数据
function yxData(){
	$.getJSON('js/data/yinxiang.js?code='+hqxx_code, function(data){
		var yxhtml = '';
		$.each(data, function(i,yxdata){
			if (i > 8){
				$("#yxMore").show();
				$(yx).css({"height":"87px"});
			}
			yxhtml += '<li onclick="addYx(this)" id="yxid_'+ yxdata['yxid'] + '" title="' + yxdata['yxtxt'] + yxdata['sum'] + ' 赞同" class="c'+ Math.ceil(Math.random()*3) +'">'+ yxdata['yxtxt'] +'</li>';
		})
		$(yx).html(yxhtml);
	});
};



//印象添加
function openyx(obj){
	var msgbox3=document.getElementById("msgbox3");
	msgbox3.style.display="block";
	msgbox3.style.left=getPos(obj).l-msgbox3.offsetWidth+'px';
	msgbox3.style.top=getPos(obj).t+obj.offsetHeight+'px';
}
function addYx(obj){
	if(!window.userID){
		addIStock(obj);
	}else{
		var yxid = (obj.id).split("_")[1];
		$.getJSON('/2013/Data/Express.ashx?type=1&stockid='+ yx_code + '&id='+ yxid);
		openyx(obj);
	}
}

//所属板块
function ssbkStockData(){
	var ssbkStockHtml = '<table class="data6" width="100%"><col width="40%"><col width="30%"><col width="30%"><thead><tr><th>名称</th><th class="tr">平均涨幅</th><th class="tr">涨跌家数</th></tr></thead><tbody>';
	$.ajax({ 
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/gb/a/quotelist?code=otherH01010,otherH09010,otherH38000,otherH40004,otherH50002&column=code,name,price,updownrate,rise,fall",
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.Data[0], function(i){
				if (data.Data[0][i][3] > 0){
					ssbkStockHtml += '<tr><td><a href="#" target="_blank" class="unl">'+data.Data[0][i][1]+'</a></td><td class="tr"><span class="color_900">'+data.Data[0][i][3]/100+'%</span></td><td class="tr"><span class="color_900">'+data.Data[0][i][4]+'</span>/<span class="color_090">'+data.Data[0][i][5]+'</span></td></tr>';
				}else if(data.Data[0][i][3] < 0){
					ssbkStockHtml += '<tr><td><a href="#" target="_blank" class="unl">'+data.Data[0][i][1]+'</a></td><td class="tr"><span class="color_090">'+data.Data[0][i][3]/100+'%</span></td><td class="tr"><span class="color_900">'+data.Data[0][i][4]+'</span>/<span class="color_090">'+data.Data[0][i][5]+'</span></td></tr>';
				}else{
					ssbkStockHtml += '<tr><td><a href="#" target="_blank" class="unl">'+data.Data[0][i][1]+'</a></td><td class="tr">'+data.Data[0][i][3]/100+'%</td><td class="tr"><span class="color_900">'+data.Data[0][i][4]+'</span>/<span class="color_090">'+data.Data[0][i][5]+'</span></td></tr>';
				}
			});
			ssbkStockHtml += '</table>';
			$('#ssbkStock').html(ssbkStockHtml);
		}	
	}); 
};


$(function(){
	zxgTotal();													//自选股总数
	timeS();														//onload-交易状态
	hqxxData(hqxx_code);								//onload-行情信息
	xgzqData(xgzq_Hcode,xgzq_Acode);		//onload-相关证券
	yxData();														//印象
	tjgzStockData();										//推荐的关注
	getLoginInfo();											//登录判断
	ssbkStockData();
});


