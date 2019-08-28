'use strict';

// Array com todas as palestras
var allTalks;

// Sessões com seus respectivos horários de inicio e duração máxima (em minutos)
let sessions = [{
    message: "Lunch",
    start: 540,
    min_duration: 180,
    max_duration: 180
}, {
    message: "Networking Event",
    start: 780,
    min_duration: 180,
    max_duration: 240
}];

var Conference = module.exports = function(data) {
    // Cada linha de entrada corresponde a uma palestra
    var rawTalks = data.split('\n');

    // Remover as linhas em branco
    rawTalks = rawTalks.filter(function(talk) {
        return talk.length > 0
    });

    // Padronização: converter a palavra "lightning" para seu equivalente
    // em minutos (desde que esteja no final da frase)
    for (var i = 0; i < rawTalks.length; i++) {
        rawTalks[i] = rawTalks[i].replace(/\s{1}lightning$/gi, " 5min")
    }

    allTalks = [];
    rawTalks.forEach(function(talk) {
        // extrair a duração em minutos das palestras utilizando RegExp
        let match = talk.match(/\s{1}[0-9]*min$/gi);
        if (match != null && match[0] != null) {
            let duration = parseInt(match[0].replace(/[^0-9]/gi, ''));

            // Verificar se é uma duração válida, ou seja, com possibilidades
            // de encaixe em alguma sessão
            let isValidDuration = duration > 0 && sessions.filter(function(session) {
                return session.max_duration >= duration
            }).length > 0

            // Se for uma duração válida, criamos a palestra com titulo e duração
            if (isValidDuration) {
                allTalks.push({
                    title: talk.replace(/\s{1}5min$/gi, " lightning"), // voltar ao texto original
                    duration: duration
                });
            }
        }
    });

    // Armazenar ordenando do menor para o maior tempo de duração...
    allTalks = allTalks.sort(function(t1, t2) {
        return t1.duration > t2.duration ? 1 : t1.duration < t2.duration ? -1 : 0
    });

    // Armazenar ordenando do maior para o menor tempo de duração...
    // Não gera conflitos de horários, mas fará os eventos da primeira manhã
    // terminarem antes do meio-dia, o que segundo o texto (must) não deve ocorrer.
    // allTalks = allTalks.sort(function(t1, t2) {
    //     return t1.duration < t2.duration ? 1 : t1.duration > t2.duration ? -1 : 0
    // });
}

Conference.prototype.printTracks = function() {
    // Apenas para simular um cenário com base de dados,
    // clonamos as palestras para que possam apaga-las sem preocupações
    var talks = allTalks.slice();

    // Array para armazenar os roteiros gerados
    var tracks = [];

    // Só saimos daqui com todas as palestras agendadas
    var isTrackValid = true;
    while (talks.length > 0) {
        // Adicionamos um novo roteiro (que no caso é um array de eventos)
        var track = {
            title: "Track " + (tracks.length + 1),
            events: []
        }
        tracks.push(track);

        for (var i = 0; i < sessions.length; i++) {
            // Quanto da sessão já foi usado/ocupado
            var sessionTimeUsed = 0;

            // Fazemos um loop no array de trás para frente,
            // assim não detona a lógica quando um elemento é removido
            for (var j = talks.length - 1; j >= 0; j--) {
                // Se o tempo resultante for menor que a duração da sessão
                if (sessionTimeUsed + talks[j].duration <= sessions[i].max_duration) {
                    // Removemos a palestra da lista de possíveis palestras
                    let talk = talks.splice(j, 1)[0];
                    // adicionamos ela no roteiro atual
                    track.events.push({
                        title: talk.title,
                        start: sessions[i].start + sessionTimeUsed
                    });
                    // e incrementamos o tempo utilizado da sessão
                    sessionTimeUsed += talk.duration;
                }
                if (sessionTimeUsed >= sessions[i].duration) {
                    break;
                }
            }

            // a duração acumulada até o fim deste roteiro respeita o minimo e o máximo solicitado?
            if (sessionTimeUsed < sessions[i].min_duration || sessionTimeUsed > sessions[i].max_duration) {
                isTrackValid = false; // se não respeita saimos do loop
                break;
            } else {
                // se respeita os limites adicionamos o evento de fim de sessão ao roteiro
                track.events.push({
                    title: sessions[i].message,
                    start: sessions[i].start + sessions[i].max_duration
                });
            }
        }

        if (!isTrackValid) {
            break;
        }
    }

    // Se todas as tracks são válidas exibimos o resultado no console
    if (isTrackValid) {
        tracks.forEach(function(track) {
            console.log(track.title + ":");
            track.events.forEach(function(event) {
                console.log(printMinutesInHours(event.start) + ' ' + event.title);
            });
        });
    } else {
        // do contrário exibimos uma mensagem de erro
        console.error('As palestras informadas não correspondem a duração mínima e máxima das sessões.');
    }
}

function printMinutesInHours(minutes) {
    var hours = parseInt(minutes / 60)
    var strHours = hours.toString();
    if (strHours.length == 1) {
        strHours = "0" + strHours;
    }

    var strMinutes = (minutes % 60).toString();
    if (strMinutes.length == 1) {
        strMinutes = "0" + strMinutes;
    }

    if (minutes < 720) {
        return strHours + ':' + strMinutes + 'AM';
    }
    return strHours + ':' + strMinutes + 'PM';
}
