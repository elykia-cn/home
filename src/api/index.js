// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn/?c=c&c=d&c=f&c=h&c=i?c=j&c=k");
  return await res.json();
};

/**
 * 天气
 */
// 获取腾讯地理位置信息（通过 IP 获取 adcode）
// 获取腾讯地理位置信息（JSONP 方式）
// 封装 JSONP 工具函数
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_cb_" + Date.now();

    // 定义回调
    window[callbackName] = (data) => {
      resolve(data);
      delete window[callbackName];
      document.body.removeChild(script);
    };

    // 动态加载 script
    const script = document.createElement("script");
    script.src = `${url}&callback=${callbackName}`;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// 获取腾讯地理位置信息（通过 IP 获取 adcode）
export const getTXAdcode = async (key) => {
  const url = `https://apis.map.qq.com/ws/location/v1/ip?key=${key}&output=jsonp`;
  return await jsonp(url);
};

// 获取腾讯地理天气信息（JSONP 方式）
export const getTXWeather = async (key, adcode) => {
  const url = `https://apis.map.qq.com/ws/weather/v1/?key=${key}&adcode=${adcode}&type=now&output=jsonp`;
  return await jsonp(url);
};

// 获取高德地理位置信息
export const getGDAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getGDWeather = async (key, city) => {
  const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`);
  return await res.json();
};
