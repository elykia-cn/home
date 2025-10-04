<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">
      {{ weatherData.weather.windpower?.endsWith("级")
        ? weatherData.weather.windpower
        : weatherData.weather.windpower + "级" }}&nbsp;
    </span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, h } from "vue";
import { ElMessage } from "element-plus";
import { Error } from "@icon-park/vue-next";

import { 
  getTXAdcode, getTXWeather, 
  getGDAdcode, getGDWeather, 
} from "@/api";

import type {
  AdCode,
  WeatherInfo,
  TXAdCodeResponse,
  TXWeatherResponse,
  GDAdCodeResponse,
  GDWeatherResponse,
} from "@/typings/weather";


// 配置密钥
const txkey = import.meta.env.VITE_TX_WEATHER_KEY; // 腾讯天气密钥
const gdkey = import.meta.env.VITE_GD_WEATHER_KEY; // 高德天气密钥

// 响应式天气数据
const weatherData = reactive<{
  adCode: AdCode;
  weather: WeatherInfo;
}>({
  adCode: { city: null, adcode: null },
  weather: { weather: null, temperature: null, winddirection: null, windpower: null },
});

// 错误提示
const onError = (message: string) => {
  ElMessage({
    message,
    icon: h(Error, { theme: "filled", fill: "var(--el-message-icon-color)" }),
  });
};

// 获取高德天气
const getGDW = async () => {
  console.log("使用高德天气接口");
  const adCode = (await getGDAdcode(gdkey)) as GDAdCodeResponse;

  if (String(adCode?.infocode) !== "10000" || String(adCode?.status) !== "1") {
    throw "高德定位失败";
  }

  weatherData.adCode = {
    city: adCode.city || adCode.province || "未知地区",
    adcode: adCode.adcode || null,
  };

  if (!weatherData.adCode.adcode) throw "高德定位无效";

  const result = (await getGDWeather(gdkey, weatherData.adCode.adcode)) as GDWeatherResponse;
  if (String(result?.status) !== "1" || String(result?.infocode) !== "10000") throw "高德天气获取失败";

  weatherData.weather = {
    weather: result.lives[0].weather,
    temperature: result.lives[0].temperature,
    winddirection: result.lives[0].winddirection,
    windpower: result.lives[0].windpower,
  };
};


// 获取腾讯天气
const getTXW = async () => {
  console.log("使用腾讯天气接口");
  const adCode = (await getTXAdcode(txkey)) as TXAdCodeResponse;
  if (String(adCode.status) !== "0") throw "腾讯定位信息获取失败";

  weatherData.adCode = {
    city: adCode.result.ad_info.city || adCode.result.ad_info.province || "未知地区",
    adcode: adCode.result.ad_info.adcode,
  };

  if (!weatherData.adCode.adcode) throw "腾讯定位无效";

  const txWeather = (await getTXWeather(txkey, weatherData.adCode.adcode)) as TXWeatherResponse;
  if (String(txWeather.status) !== "0") throw "腾讯天气获取失败";

  const realtimeData = txWeather.result.realtime?.[0];
  if (!realtimeData?.infos) throw "腾讯实时天气缺失";

  weatherData.weather = {
    weather: realtimeData.infos.weather,
    temperature: realtimeData.infos.temperature,
    winddirection: realtimeData.infos.wind_direction,
    windpower: realtimeData.infos.wind_power,
  };
};

// 获取天气数据（高德优先，腾讯兜底）
const getWeatherData = async () => {
  if (gdkey) {
    try {
      await getGDW();
      return; // 成功获取高德天气，直接返回
    } catch (err) {
      console.error(err);
      if (!txkey) {
        onError("天气信息获取失败：未配置腾讯Key或高德接口失败");
        return;
      }
      // 尝试腾讯
      try {
        await getTXW();
        return; // 成功获取腾讯天气，直接返回
      } catch (err2) {
        console.error(err2);
        onError("天气信息获取失败，请稍后重试");
        return;
      }
    }
  } else if (txkey) {
    try {
      await getTXW();
      return;
    } catch (err) {
      console.error(err);
      onError("天气信息获取失败，请稍后重试");
      return;
    }
  } else {
    onError("天气信息获取失败：未配置高德或腾讯Key");
    return;
  }
};

// 组件挂载
onMounted(() => {
  getWeatherData();
});
</script>
