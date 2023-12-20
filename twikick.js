function copyToClipboard(val) {
  const t = document.createElement('textarea');
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
}
function getCookie(cookieName) {
  cookieName = `${cookieName}=`;
  let cookieData = document.cookie;
  let cookieValue = '';
  let start = cookieData.indexOf(cookieName);
  if (start !== -1) {
    start += cookieName.length;
    let end = cookieData.indexOf(';', start);
    if (end === -1) end = cookieData.length;
    cookieValue = cookieData.substring(start, end);
  }
  return decodeURIComponent(cookieValue);
}
function makem3u8_vod(vod_id, streams_id, started_at, username, extra = 0) {
  return new Promise(async resolve => {
    const res = await fetch(`https://cors.taedin.live/https://vod.nxwqwer.com/${vod_id}`);
    const result = await res.text();
    const match = result.match(/(?<=<A\shref=")(.*?)(?=">)/) || [];
    const val = (match.length) ? match[0] : [];
    if (val.includes(vod_id) && val.includes(streams_id)) resolve(val);
    else resolve(await makem3u8(streams_id, started_at, username, extra));
  })
}
async function makem3u8(streams_id, started_at, username, extra = 0) {
  const unix = Math.floor(new Date(started_at).getTime() / 1000) - extra;
  const keys = [0, 1, -1].map(adjust => [username, streams_id, unix + adjust].join('_'));
  const serials = await Promise.all(keys.map(async key => [[...new Uint8Array(await crypto.subtle.digest('SHA-1',new TextEncoder().encode(key)))].map(x=>x.toString(16).padStart(2,'0')).join('').substring(0,20), key].join('_')));
  const servers = ['d1mhjrowxxagfy.cloudfront.net', 'd3vd9lfkzbru3h.cloudfront.net', 'd1m7jfoe9zdc1j.cloudfront.net', 'd2nvs31859zcd8.cloudfront.net', 'dgeft87wbj63p.cloudfront.net'];
  const slugs = ['index-dvr.m3u8', '1.ts', '100.ts'];
  const res = await fetch(`https://cors.taedin.live/https://d3vd9lfkzbru3h.cloudfront.net/${serials[0]}/chunked/index-dvr.m3u8`, {method: 'HEAD'});
  if (res.status == 200) return `https://d3vd9lfkzbru3h.cloudfront.net/${serials[0]}/chunked/index-dvr.m3u8`;
  else {
    const m3u8s = await Promise.all(serials.map(async (serial) => await Promise.all(servers.map(async (server) => await Promise.all(slugs.map(async (slug) => {
      try {
        const data = await fetch(`https://cors.taedin.live/https://${server}/${serial}/chunked/${slug}`, {method: 'HEAD'});
        if (data.status == 200) return `https://${server}/${serial}/chunked/index-dvr.m3u8`;
        else return;
      } catch (err) {}
    }), )), )), );
    const m3u8 = [...new Set(m3u8s.flat(Infinity).filter((element) => element !== undefined))];
    if (m3u8[0]) return m3u8[0];
    else {
      alert('다시보기가 삭제되거나 처음부터 없을 가능성이 매우 높습니다.');
      return `https://d3vd9lfkzbru3h.cloudfront.net/${serials[0]}/chunked/index-dvr.m3u8`;
    }
  }
}
async function makem3u8_kick(cookie, cid, ccode, date, rtext) {
  const keys = [0, -1, 1].map(adjust => [cid, ccode, date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes() + adjust, rtext].join('/'));
  const slugs = ['master.m3u8', '1.ts', '100.ts'];
  const res = await fetch(`https://cors.taedin.live/https://stream.kick.com/ivs/v1/${keys[0]}/media/hls/master.m3u8`, {'headers': {
    'authorization': `Bearer ${cookie}`,
    'x-xsrf-token': cookie
  },
  method: 'HEAD'});
  if (res.status == 200) return `https://stream.kick.com/ivs/v1/${keys[0]}/media/hls/master.m3u8`;
  else {
    const m3u8s = await Promise.all(keys.map(async (key) => await Promise.all(slugs.map(async (slug) => {
      try {
        const data = await fetch(`https://cors.taedin.live/https://stream.kick.com/ivs/v1/${key}/media/hls/${slug}`, {'headers': {
          'authorization': `Bearer ${cookie}`,
          'x-xsrf-token': cookie
        },
        method: 'HEAD'});
        if (data.status == 200) return `https://stream.kick.com/ivs/v1/${key}/media/hls/master.m3u8`;
        else return;
      } catch (err) {}
    }), )), );
    const m3u8 = [...new Set(m3u8s.flat(Infinity).filter((element) => element !== undefined))];
    if (m3u8[0]) return m3u8[0];
    else {
      alert('다시보기가 삭제됐을 가능성이 매우 높습니다.');
      return `https://stream.kick.com/ivs/v1/${keys[0]}/media/hls/master.m3u8`;
    }
  }
}
async function main(copy_L = true, open_L = true) {
  if (location.hostname.includes('twitch.tv')) {
    if (location.pathname.split('/')[1] == 'videos') {
      const res = await fetch(`https://cors.taedin.live/https://vod.544146.workers.dev/${location.pathname.split('/')[2]}`);
      const result = await res.text();
      var link = result.match(/(?<=<a\shref=")(.*?)(?=">)/)[0];
      if (copy_L) {
        try {copyToClipboard(link)}
        catch {await navigator.clipboard.writeText(link)}
      }
      if (open_L) open(link);
    } else {
      const username = location.pathname.split('/')[1];
      try {
        const res1 = await fetch('https://cors.taedin.live/https://gql.twitch.tv/gql', {
          headers: {
            'client-id': 'jzkbprff40iqj646a697cyrvl0zt2m6',
          },
          body: JSON.stringify([{
            operationName: 'ChannelVideoLength',
            variables: {
              channelLogin: username
            },
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash: 'ac644fafd686f2cb0e3864075af7cf3bb33f4e0525bf84921b10eabaa4e048b5'
              }
            }
          }, {
            operationName: 'UseLive',
            variables: {
              channelLogin: username
            },
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash: '639d5f11bfb8bf3053b424d9ef650d04c4ebb7d94711d644afb08fe9a0fad5d9'
              }
            }
          }]),
          method: 'POST',
        })
        const result1 = await res1.json();
        var streams_id = (result1[1]['data']['user']['stream']) ? result1[1]['data']['user']['stream']['id'] : null;
        var started_at = (result1[1]['data']['user']['stream']) ? result1[1]['data']['user']['stream']['createdAt'] : null;
        var vod_id = (result1[0]['data']['user']['videos']['edges'].length) ? result1[0]['data']['user']['videos']['edges'][0]['node']['id'] : null;
      } catch (error) {
        alert(`API 불러오기 실패 \n${error}`);
        console.log(`API 불러오기 실패 \n${error}`);
        return;
      }

      if (!streams_id) {
        alert(`${username}은 방송 중이 아닙니다.`);
        console.log(`${username}은 방송 중이 아닙니다.`);
        return;
      } else {
        try {
          var link = (vod_id) ? await makem3u8_vod(vod_id, streams_id, started_at, username) : await makem3u8(streams_id, started_at, username);
          if (copy_L) {
            try {copyToClipboard(link)}
            catch {await navigator.clipboard.writeText(link)}
          }
          if (open_L) open(link);
        } catch (err) {
          alert(`m3u8 불러오기 실패\n${err}`)
        }
      }
    }
  } else if (location.hostname.includes('streamscharts.com')) {
    try {
      const res4 = await fetch(location.href);
      const result4 = await res4.text();
      const vod_id = result4.match(/(?<=video=v)(.*?)(?=&amp;parent)/) || [];
      var link = (vod_id.length) ? await makem3u8_vod(vod_id[0], location.pathname.split('/')[4], result4.match(/(?<=stream_created_at&quot;:&quot;)(.*?)(?=&quot;,&quot)/)[0], location.pathname.split('/')[2], (new Date().getTimezoneOffset() * 60)) : await makem3u8(location.pathname.split('/')[4], result4.match(/(?<=stream_created_at&quot;:&quot;)(.*?)(?=&quot;,&quot)/)[0], location.pathname.split('/')[2], (new Date().getTimezoneOffset() * 60));
    } catch (error) {
      alert(`스트림차트 불러오기 실패 \n${error}`);
      console.log(`스트림차트 불러오기 실패 \n${error}`);
    }
    if (copy_L) {
      try {copyToClipboard(link)}
      catch {await navigator.clipboard.writeText(link)}
    }
    if (open_L) open(link);
  } else if (location.hostname.includes('twitchtracker.com')) {
    try {
      const res5 = await fetch(location.href);
      const result5 = await res5.text();
      var link = await makem3u8(location.pathname.split('/')[3], result5.match(/(?<=\sstream\son\s)(.*?)(?=\s-\s)/)[0], location.pathname.split('/')[1], (new Date().getTimezoneOffset() * 60));
    } catch (error) {
      alert(`트위치트래커 불러오기 실패 \n${error}`);
      console.log(`트위치트래커 불러오기 실패 \n${error}`);
    }
    if (copy_L) {
      try {copyToClipboard(link)}
      catch {await navigator.clipboard.writeText(link)}
    }
    if (open_L) open(link);
  } else if (location.hostname.includes('kick.com')) {
    var cookie = getCookie('XSRF-TOKEN');
    if (location.pathname.split('/')[1] == 'video') {
      try {
        const res6 = await fetch(`https://kick.com/api/v1/video/${location.pathname.split('/')[2]}`, {'headers': {
          'authorization': `Bearer ${cookie}`,
          'x-xsrf-token': cookie
        },
        'method': 'GET',
      });
      const result6 = await res6.json();
      var link = result6['source'];
      } catch (error) {
        alert(`킥 API 불러오기 실패 \n${error}`);
        console.log(`킥 API 불러오기 실패 \n${error}`);
      }
      if (copy_L) {
        try {copyToClipboard(link)}
        catch {await navigator.clipboard.writeText(link)}
      }
      if (open_L) open(link);
    } else 
      try {
        const res7 = await fetch(`https://kick.com/api/v1/channels/${location.pathname.split('/')[1]}`, {'headers': {
          'authorization': `Bearer ${cookie}`,
          'x-xsrf-token': cookie
        },
        'method': 'GET',
        });
        const result7 = await res7.json();
        var data = result7['playback_url'].split('.');
        var link = await makem3u8_kick(cookie, data[5], data[7], new Date(result7['livestream']['start_time']), result7['livestream']['thumbnail']['url'].split('/')[5]);
      } catch (error) {
        alert(`킥 불러오기 실패 \n${error}`);
        console.log(`킥 불러오기 실패 \n${error}`);
      }
      if (copy_L) {
        try {copyToClipboard(link)}
        catch {await navigator.clipboard.writeText(link)}
      }
      if (open_L) open(link);
    } else alert('주소가 잘못되었습니다. \n지원되는 주소는 twitch.tv, streamscharts.com, twitchtracker.com, kick.com 입니다.');
}
