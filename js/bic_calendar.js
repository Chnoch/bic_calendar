/*
 *
 * bic calendar
 * Autor: bichotll
 * Web-autor: bic.cat
 * Web script: http://bichotll.github.io/bic_calendar/
 * Llicència Apache
 *
 */

$.fn.bic_calendar = function(options) {
    
    var opts = $.extend({}, $.fn.bic_calendar.defaults, options);
    
    this.each(function(){
        
        var calendario;
        var divMonth;
        var capaTextoMesAnoActual = $('<div class="visualmesano"></div>');

        var id_calendari = "bic_cal_" + Math.floor(Math.random()*99999).toString(36);

        var events = opts.events;
        
        var dias;
        if ( typeof opts.dias != "undefined" )
            dias = opts.dias;
        else
            dias = ["l", "m", "x", "j", "v", "s", "d"];

        var nombresMes;
        if ( typeof opts.nombresMes != "undefined" )
            nombresMes = opts.nombresMes;
        else
            nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        var show_days;
        if ( typeof opts.show_days != "undefined" )
            show_days = opts.show_days;
        else
            show_days = true;

        var popover_options;
        if ( typeof opts.popover_options != "undefined" )
            popover_options = opts.popover_options;
        else
            popover_options = {placement: 'top'};

        var tooltip_options;
        if ( typeof opts.tooltip_options != "undefined" )
            tooltip_options = opts.tooltip_options;
        else
            tooltip_options = {placement: 'top'};

        var req_ajax;
        if ( typeof opts.req_ajax != "undefined" )
            req_ajax = opts.req_ajax;
        else
            req_ajax = false;


		
        //element llamado
        var elem = $(this);
                
        //mostrem el calendari
        showCalendar();
        
        
        
        /*** functions ***/
        
        //funció para mostrar el calendari
        function showCalendar(){

            //capa con los días del mes
            divMonth = $('<table class="diasmes table table">');

            list_literals_weekdays();
				
            //un objeto de la clase date para calculo de fechas
            var objDate = new Date();
            //miro si en el campo INPUT tengo alguna fecha escrita
            var textDateWritten = elem.val();
            if (textDateWritten!= ""){
                if (validateDateWritten(textDateWritten)){
                    var arrayDateWritten = textDateWritten.split("/");
                    //hago comprobación sobre si el año tiene dos cifras
                    if(arrayDateWritten[2].length == 2){
                        if (arrayDateWritten[2].charAt(0)=="0"){
                            arrayDateWritten[2] = arrayDateWritten[2].substring(1);
                        }
                        arrayDateWritten[2] = parseInt(arrayDateWritten[2]);
                        if (arrayDateWritten[2] < 50)
                            arrayDateWritten[2] += 2000;
                    }
                    objDate = new Date(arrayDateWritten[2], arrayDateWritten[1]-1, arrayDateWritten[0])
                }
            }
				
            //mes y año actuales
            var mes = objDate.getMonth();
            var ano = objDate.getFullYear();
            //muestro los días del mes y año dados
            sampleDayMonth(mes, ano);
				
				
            //controles para ir al mes siguiente / anterior
            var buttonMonthNext = $('<td><a href="#" class="buttonMonthNext"><i class="icon-arrow-right" ></i></a></td>');
            buttonMonthNext.click(function(e){
                e.preventDefault();
                mes = (mes + 1) % 12;
                if (mes==0)
                    ano++;
                canvi_mes(mes, ano);
            })
            var buttonMonthPrevious = $('<td><a href="#" class="buttonMonthPrevious"><i class="icon-arrow-left" ></i></a></td>');
            buttonMonthPrevious.click(function(e){
                e.preventDefault();
                mes = (mes - 1);
                if (mes==-1){
                    ano--;
                    mes = 11;
                }	
                canvi_mes(mes, ano);
            })
			
            //capa para mostrar el texto del mes y ano actual
            var capaTextoMesAno = $('<table class="table header"><tr></tr></table>');
            var capaTextoMesAnoControl = $('<td colspan=5 class="mesyano span6"></td>');
            capaTextoMesAno.append(buttonMonthPrevious);
            capaTextoMesAno.append(capaTextoMesAnoControl);
            capaTextoMesAno.append(buttonMonthNext);
            capaTextoMesAnoControl.append(capaTextoMesAnoActual);
				
            //calendario y el borde
            calendario = $('<div class="bic_calendar" id="' +id_calendari +'" ></div>');
            calendario.prepend(capaTextoMesAno);
            //calendario.append(capaDiasSemana);
            //divMonth.prepend(capaDiasSemana);
            calendario.append(divMonth);
				
            //inserto el calendario en el documento
            elem.append(calendario);
            
            check_events(mes, ano);
        }
		
        function canvi_mes(mes, ano){
            divMonth.empty();
            list_literals_weekdays();
            sampleDayMonth(mes, ano);
            check_events(mes, ano);
        }       

        //funció mostra literals setmana
        function list_literals_weekdays(){
            if ( show_days != false ){
                var capaDiasSemana = $('<tr class="dias_semana" >');
                var codigoInsertar = '';
                $(dias).each(function(indice, valor){
                    codigoInsertar += '<td';
                    if (indice==0){
                        codigoInsertar += ' class="primero"';
                    }
                    if (indice==6){
                        codigoInsertar += ' class="domingo ultimo"';
                    }
                    codigoInsertar += ">" + valor + '</td>';
                });
                codigoInsertar += '</tr>';
                capaDiasSemana.append(codigoInsertar);

                divMonth.append(capaDiasSemana);
            }
        }
                
        function sampleDayMonth(mes, ano){
            //console.log("muestro (mes, ano): ", mes, " ", ano)
            //muestro en la capaTextoMesAno el mes y ano que voy a dibujar
            capaTextoMesAnoActual.text(nombresMes[mes] + " " + ano);
			
            //muestro los días del mes
            var contadorDias = 1;
			
            //calculo la fecha del primer día de este mes
            var primerDia = calculaNumeroDiaSemana(1, mes, ano);
            //calculo el último día del mes
            var ultimoDiaMes = ultimoDia(mes,ano);
            
            var n_mes = mes + 1;
            
            var capaDiasMes_string = "";
			
            //escribo la primera fila de la semana
            for (var i=0; i<7; i++){
                if (i < primerDia){
                    var codigoDia = "";
                    if (i == 0)
                        codigoDia += "<tr>";
                    //si el dia de la semana i es menor que el numero del primer dia de la semana no pongo nada en la celda
                    codigoDia += '<td class="diainvalido';
                    if (i == 0)
                        codigoDia += " primero";
                    codigoDia += '"></td>';
                } else {
                    var codigoDia = "";
                    if (i == 0)
                        codigoDia += '<tr>';
                    codigoDia += '<td id="' + id_calendari + '_' + contadorDias + "_" +  n_mes  + "_" + ano + '" ';
                    if (i == 0)
                        codigoDia += ' class="primero"';
                    if (i == 6)
                        codigoDia += ' class="ultimo domingo"';
                    codigoDia += '><a>' + contadorDias + '</a></span>';
                    if (i == 6)
                        codigoDia += '</tr>';
                    contadorDias++;
                }
                capaDiasMes_string += codigoDia
            }
			
            //recorro todos los demás días hasta el final del mes
            var diaActualSemana = 1;
            while (contadorDias <= ultimoDiaMes){
                var codigoDia = "";
                if (diaActualSemana % 7 == 1)
                    codigoDia += "<tr>";
                codigoDia += '<td id="' + id_calendari + '_' + contadorDias + "_" +  n_mes  + "_" + ano + '" ';
                //si estamos a principio de la semana escribo la clase primero
                if (diaActualSemana % 7 == 1)
                    codigoDia += ' class="primero"';
                //si estamos al final de la semana es domingo y ultimo dia
                if (diaActualSemana % 7 == 0)
                    codigoDia += ' class="domingo ultimo"';
                codigoDia += '><a>' + contadorDias + '</a></td>';
                if (diaActualSemana % 7 == 0)
                    codigoDia += "</tr>";
                contadorDias++;
                diaActualSemana++;
                capaDiasMes_string += codigoDia
            }
			
            //compruebo que celdas me faltan por escribir vacias de la última semana del mes
            diaActualSemana--;
            if (diaActualSemana%7!=0){
                codigoDia = "";
                for (var i=(diaActualSemana%7)+1; i<=7; i++){
                    var codigoDia = "";
                    codigoDia += '<td class="diainvalido';
                    if (i==7)
                        codigoDia += ' ultimo'
                    codigoDia += '"></td>';
                    if (i==7)
                        codigoDia += '</tr>'
                    capaDiasMes_string += codigoDia
                }
            }
            
            divMonth.append( capaDiasMes_string );
        }
        //función para calcular el número de un día de la semana
        function calculaNumeroDiaSemana(dia,mes,ano){
            var objDate = new Date(ano, mes, dia);
            var numDia = objDate.getDay();
            if (numDia == 0) 
                numDia = 6;
            else
                numDia--;
            return numDia;
        }
		
        //función para ver si una fecha es correcta
        function checkdate ( m, d, y ) {
            // función por http://kevin.vanzonneveld.net
            // extraida de las librerías phpjs.org manual en http://www.desarrolloweb.com/manuales/manual-librerias-phpjs.html
            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
        }
		
        //funcion que devuelve el último día de un mes y año dados
        function ultimoDia(mes,ano){ 
            var ultimo_dia=28; 
            while (checkdate(mes+1,ultimo_dia + 1,ano)){ 
                ultimo_dia++; 
            } 
            return ultimo_dia; 
        } 
		
        function validateDateWritten(fecha){
            var arrayFecha = fecha.split("/");
            if (arrayFecha.length!=3)
                return false;
            return checkdate(arrayFecha[1], arrayFecha[0], arrayFecha[2]);
        }

        function check_events(mes, ano){
            if (req_ajax != false){
                //peticio ajax
                $.ajax({
                    type: req_ajax.type,
                    url: req_ajax.url,
                    data: { mes: mes + 1, ano: ano },
                    dataType: 'json'
                }).done(function( data ) {

                    events = [];

                    $.each(data, function(k,v){
                        events.push(data[k]);
                    });

                    marcarEventos(mes, ano);

                });
            } else {
                marcarEventos(mes, ano);
            }
        }
        
        function marcarEventos(mes, ano){
            var t_mes = mes + 1;
            
            for(var i=0; i< events.length; i++) {
                
                if ( events[i][0].split('/')[1] == t_mes && events[i][0].split('/')[2] == ano ){

                    $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") ).addClass('event');
                    
                    $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('data-original-title', events[i][1]);
                    
                    //bg
                    if ( events[i][3] )
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") ).css('background', events[i][3]);
                    
                    //link
                    if ( events[i][2] == '' || events[i][2] == '#' ){
                        if ( events[i][4] != '' ){
                            $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('data-trigger', 'manual');
                            $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).addClass('manual_popover');
                        } else {
                            $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('href', 'javascript:false;');
                        }
                    } else {
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('href', events[i][2]);
                    }


                    //tooltip vs popover
                    if ( events[i][4] ){
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") ).addClass('event_popover');
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('rel', 'popover');
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('data-content', events[i][4]);
                    } else {
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") ).addClass('event_tooltip');
                        $('#' + id_calendari + '_' + events[i][0].replace(/\//g, "_") + ' a' ).attr('rel', 'tooltip');
                    }
                }
            }
            
            $('#' + id_calendari + ' ' + '.event_tooltip a').tooltip(tooltip_options);
            $('#' + id_calendari + ' ' + '.event_popover a').popover(popover_options);

            $('.manual_popover').click( function(){
                $(this).popover('toggle');
            } );
        }
        
    /*** --functions-- ***/
        
        
        
    });
    return this;
};


//defaults values
/*$.fn.highlight.defaults = {  
    
    };*/
