/*************既知・未実装の問題*********************

・iOS Safariで効果音が一度しか再生できない

*************タスク********************************
◯デザイン
◯CSSへの実装
◯効果音連携
◯スコア処理の調整
◯ゲーム体験の改善
◯fontのウェイトの反映
◯CSSアニメーションをもっとくわえる（時計震えるなど）
◯＼ハイスコア／をぴょんぴょんさせる
◯localStorage.setItemによるスコア保存
◯Drive to webでのホスティング

Webで公開してみる前にやること
◯画像等の極力圧縮
・OGP画像を作る
・OGPタグの設定
・モバイル対応の調整

もし秋季展とかやるなら
・スコアボード機能を設ける
・スコア情報をサーバーに保存できるようにする（GASでもいいかも）
・モバイル対応する
・PWA的にしてみる
・Firebaseでホスティングする
***********************************/
jQuery(function(){
	//グローバル変数
	var nowScore = 0;	//ゲームのスコアを管理
	var maxScore = localStorage.getItem("saveMaxScore");
	if(localStorage.getItem("saveMaxScore") === null){
		maxScore = 0;
	}
	var nowStage = 1;
	var maxStage = 10;
	var gameTimeLimit = 5000;	//ゲームの制限時間を設定
	
	$(window).keydown(function(e){ //Debug用、0を押すとmaxScoreの初期化
		if(e.keyCode == 48){
			maxScore = 0;
		}
	})
	
	$(".maxStage").text(maxStage);
	
	//PlaySound
	$("button").on("mouseenter",function(){
		$("#playHover")[0].pause();
		$("#playHover")[0].currentTime = 0;
		$("#playHover")[0].play();
	});
	$("button").on("click",function(){
		$("#playClick")[0].pause();
		$("#playClick")[0].currentTime = 0;
		$("#playClick")[0].play();
	});
	$("#gameWindow li").on("mouseenter",function(){
		$("#playHover")[0].pause();
		$("#playHover")[0].currentTime = 0;
		$("#playHover")[0].play();
	});
	$("#gameWindow li").on("click",function(){
		$("#playClick")[0].pause();
		$("#playClick")[0].currentTime = 0;
		$("#playClick")[0].play();
	});
	
	//画面遷移
	$("#startWindow button").on("click",switchGame);
	//GameWindowの画面遷移はゲームコントローラが担当
	$("#scoreWindow button").on("click",switchGame);
	
	
	
	//画面呼び出し
	function switchGame(){
		$("section:not(#gameWindow)").each(function(){
			$(this).css({
				"z-index":-2000,
				"pointer-events":"none"
			});
		});
		$("#gameWindow").css({
			"z-index":2000,
			"pointer-events":"auto"
		});
		nowStage = 1;
		gameController();
	}
	function switchScore(nowStage,nowScore){
		$("section:not(#scoreWindow)").each(function(){
			$(this).css({
				"z-index":-2000,
				"pointer-events":"none"
			});
		});
		$("#scoreWindow").css({
			"z-index":2000,
			"pointer-events":"auto"
		});
		//ゲームの捜査を受け付けないようにする処理をここに書く必要
		//上にdivを置いてシールドさせてしまう
		$("#shield").removeClass("shieldEnable");		//maxScoreの更新時の装飾
        
		scoreProcessing(nowStage,nowScore);
	}
	function switchStart(){
		$("section:not(#startWindow)").each(function(){
			$(this).css({
				"z-index":-2000,
				"pointer-events":"none"
			});
		});
		$("#startWindow").css({
			"z-index":2000,
			"pointer-events":"auto"
		});
		nowStage = 1;
        $(".maxScore").text(maxScore);
	}
	
	//スタート画面処理
	
	
	//ゲーム画面処理
	function gameController(){
		var leftTime = gameTimeLimit / 1000;
		var gameOver = false;
		var gameLevelParameter = 0.5; //値を大きくするほど生きている確率が上がる
        nowScore = 0;
		
		
		//メイン処理-ステージごとに発生
		function startGame(){
			console.log("---------Now stage is "+nowStage+"----------");
			$(".nowStage").text(nowStage);
			$(".nowScore").text(nowScore);
            $(".maxScore").text(maxScore);
			
			$("#timeLimit").removeClass("timeLimit_timeOver");
			

			//セミをランダム生成する処理
			//セミのタイプを決定する
			var semiType = [];
			var semiSum = 0;
			for(var i=0;i<3;i++){
				if(Math.random(1) > gameLevelParameter){ //0（死んでいる）と扱う
					semiType[i] = 0;
				}else{	//1（生きている）と扱う
					semiType[i] = 1;
				}
				semiSum += semiType[i];
				//全てのセミがおなじになってしまった場合ランダムで一つを違う値に
				if(i === 2){
					//console.log("セミの合計値"+semiSum);
					if(semiSum === 0){
						semiType[parseInt(Math.random(2.9))] = 1;
						//console.log("セミは0で一致していたので修正しました");
					}else if(semiSum === 3){
						semiType[parseInt(Math.random(2.9))] = 0;
						//console.log("セミは1で一致していたので修正しました");
					}else{
						//console.log("セミはバラバラでした");
					}
				}
				//console.log(i+"番目のセミ："+semiType[i]);
                
			}
			
			//セミ生成処理
			for(var i=0;i<3;i++){
				if(semiType[i] === 0){
					$("#semi"+(i+1)).attr("src","images/deth.png");
					$("#semi"+(i+1)).attr("alt","deth");
					console.log("DETH");
				}else{
					$("#semi"+(i+1)).attr("src","images/alive.png");
					$("#semi"+(i+1)).attr("alt","alive");
					console.log("ALIVE");
				}
			}
            
            //カウントダウンテンポ制御
            var countTempo = 1000 - nowStage * 80;
            console.log("countTempo="+countTempo);
			
            //生きてるのが勝ちか負けかを決定
            var gameMode = Math.random(1);
			console.log("Loop "+nowStage+" gameMode is "+gameMode);
            
            //クリアの選択だったか
            var judge = false;
			
			var copyLeftTime = 0;
            
			//カウントダウン連動処理
            var selected = false;
			$("#timeLimit").text(leftTime);
			function countDown(){
				console.log("leftTimeは"+leftTime+"です");
                $(".nowScore").text(nowScore);
                
				console.log("再生直前のGameOverは"+gameOver);
				//playSound
				if(leftTime === gameTimeLimit / 1000){
					$("#playStageCall")[0].play();
				}
				
				if(leftTime > 0){
					$("#playCount")[0].pause();
					$("#playCount")[0].currentTime = 0;
					$("#playCount")[0].play();
				}else if(leftTime === 0 && gameOver === true){
					$("#playHuseikai")[0].play();
				}else if(leftTime === 0 && gameOver === false){
					$("#playSeikai")[0].play();
				}else if(leftTime === 0){
					$("#playTimeOver")[0].play();
				}
				
				
				if(leftTime === 0){
					//ゲームの捜査を受け付けないようにする処理をここに書く必要
					//上にdivを置いてシールドさせてしまう
					$("#shield").addClass("shieldEnable");
					
					
					
					
					leftTime = gameTimeLimit / 1000;
                    if(selected === false){
                        $("#timeLimit").text("0");
						$("#notif").addClass("missNotif");
						$("#notif").text("TIME UP!!");
						$("#timeLimit").addClass("timeLimit_timeOver");
						$("#notif").addClass("notifTrigger");
						setTimeout(function(){
							$("#notif").removeClass("notifTrigger");
							$("#notif").removeClass("missNotif");
						},3000)
                    }else if(judge){
						$("#notif").addClass("okNotif");
						$("#notif").text("OK");
						$("#notif").addClass("notifTrigger");
						setTimeout(function(){
							$("#notif").removeClass("notifTrigger");
							$("#notif").removeClass("okNotif");
						},3000)
                    }else{
                        $("#notif").addClass("missNotif");
						$("#notif").text("MISS");
						$("#notif").addClass("notifTrigger");
						setTimeout(function(){
							$("#notif").removeClass("notifTrigger");
							$("#notif").removeClass("missNotif");
						},3000)
                    }
					
					
					console.log("0の条件に入りました");
                    
                    
                    //次どうするのか
                    if(nowStage >= maxStage){ //最大コース数
                        gameOver = true;
                        //console.log("動いてるよ！！！！");
                    }
					//gameOver = false;
					
					
					
					
                    if(gameOver){　//ゲームオーバーだったら、スコア画面へ行く処理
                        console.log("GameOver、スコアに遷移");
                        //setTimeout(function(){
                            switchScore(nowStage,nowScore);
                        //},2000);
                        console.log("switchScore is working");
                        
                        return 0;
                    }else{	//クリアだったら次のステージの手続きを行う処理
                        console.log("コース"+nowStage+"をクリア、次のステージへ");
                        nowStage++;
						//こっちのnowScore加算は次のステージに言ったことによる加算、
                        nowScore = nowScore + nowStage * 100;
                        gameLevelParameter *= 0.9; //徐々に死んでいるセミの数を増やす
                        setTimeout(startGame,2000);
                    }
                    
				}else{
					$("#timeLimit").text(leftTime);
					$("#timeLimit").addClass("timeLimit_countdown");
					setTimeout(function(){
						$("#timeLimit").removeClass("timeLimit_countdown");
					},600);
					$("#shield").removeClass("shieldEnable");
					copyLeftTime = leftTime;
					leftTime--;
					
					/************ここにセミの判定処理を書いていく******************/
                    if(gameMode > 0.5){
                        //死んでるのを押せの場合
                        if(gameMode > 0.75){
							$("#sizi").text("死んでるセミを押せ！");
						}else{
							$("#sizi").text("生きてるセミを押さないで！");
						}
                        $("#gameWindow li").each(function(){
                            $(this).on("click",function(){
                                if($(this).find("img").attr("alt") === "deth"){
                                    gameOver = false;
                                    console.log("判定が動作,deth");
                                    selected = true;
									copyLeftTime = leftTime;
                                    leftTime = 0;
                                    judge = true;
									
                                }
                                if($(this).find("img").attr("alt") === "alive"){
                                    gameOver = true;
                                    console.log("判定が動作,alive");
                                    selected = true;
									copyLeftTime = leftTime;
                                    leftTime = 0;
                                    judge = false;
                                }
                            });
                            console.log("0以上の条件に入りました");
                        });
						
                    }else{
                        //生きてるのを押せの場合
                        if(gameMode > 0.25){
							$("#sizi").text("生きてるセミを押せ！");
						}else{
							$("#sizi").text("死んでるセミを押すな！");
						}
						var cardLooped = false;
                        $("#gameWindow li").each(function(){
                            $(this).on("click",function(){
                                if($(this).find("img").attr("alt") === "deth"){
                                    gameOver = true;
                                    console.log("判定が動作,deth");
                                    selected = true;
									//copyLeftTime = leftTime;
                                    leftTime = 0;
                                    judge = false;
                                }
                                if($(this).find("img").attr("alt") === "alive"){
                                    gameOver = false;
                                    console.log("判定が動作,alive");
                                    selected = true;
									//copyLeftTime = leftTime;
                                    leftTime = 0;
                                    judge = true;
                                }
                            });
                            console.log("0以上の条件に入りました");
							cardLooped = true;
                        });
						
                    }
					
					
					
					
                    if(selected === false){
                        gameOver = true;
                    }
					
					/*****************************************************/
                    
                    setTimeout(countDown,countTempo);
				}
				
				//nowScore加算減算
				console.log("judgeが"+judge);
				console.log("selectedが"+selected);
				console.log("copyLeftTime"+copyLeftTime);
				//残り時間および正解不正解による加算減算
				if(judge === true && selected === true){
					nowScore = nowScore + 300 +  copyLeftTime * 100;
					console.log("AAAAAAAAAAAAA");
				}
				if(judge === false && selected === true){
					nowScore = nowScore - 300;
					console.log("BBBBBBBBBBBB");
				}
				
			}
			
			
			
			countDown();
		}
		startGame();
		
	}
	//スコア画面処理
	function scoreProcessing(nowStage,nowScore){
		if(nowScore > maxScore){
			maxScore = nowScore;
			//$("#result").addClass("maxScore");	//ハイスコア更新色を与える
			$("#hightScoreMsg").css({
				"display":"block"
			});
			$("#scoreWindow .nowScore").css({
				"color":"red"
			});
		}else{
			//$("#result").removeClass("maxScore");
			$("#hightScoreMsg").css({
				"display":"none"
			});
			$("#scoreWindow .nowScore").css({
				"color":"white"
			});
		}
		$(".nowScore").text(nowScore);
		$(".nowStage").text(nowStage);
		localStorage.setItem('saveMaxScore', maxScore);
	}
});