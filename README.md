<p align="center">
  <img src="/site/content/en/images/cvat-readme-gif.gif" alt="CVAT 平台" width="100%" max-width="800px">
</p>
<p align="center">
  <a href="https://app.cvat.ai/">
    <img src="/site/content/en/images/cvat-readme-button-tr-bg.png" alt="立即开始标注">
  </a>
</p>

# CVAT (计算机视觉标注工具)

CVAT 是一个免费的在线交互式视频和图像标注工具，专门用于计算机视觉任务。我们的团队使用它来标注数百万个具有不同属性的对象。许多 UI 和 UX 决策都是基于专业数据标注团队的反馈而制定的。

![CVAT 标注界面](site/content/en/images/cvat.jpg)
<img width="3838" height="1838" alt="图片" src="https://github.com/user-attachments/assets/2738c4c4-7ae3-4028-9c1e-ca0c77e02ce2" />

## 功能特点

- 目标检测和分类
- 语义分割
- 姿态估计
- 行为识别
- OCR 等更多功能
- 强大的 CNN 模型用于自动标注
- 视频标注支持
- 协作功能
- REST API 和 SDK

## 汉化版安装说明

### 先决条件

- Docker >= 20.10
- Docker Compose >= 1.29

### 快速安装

```bash
git clone https://github.com/chenyang137/cvat.git
```

```bash
cd cvat
```

无root权限用户需要使用sudo提权

```bash
docker build -f Dockerfile.ui -t cvat/ui:2.48.2 .
```

设置环境变量

```bash
export CVAT_HOST=localhost
```

然后启动服务：

```bash
docker compose up -d
```
设置管理员账号：

```
docker exec -it cvat_server bash -ic 'python3 ~/manage.py createsuperuser'
```


安装完成后，访问 http://localhost:8080 使用该应用程序。（有问题提issues，成功运行麻烦点个star～感谢）

## 文档

完整文档请见 [Read the Docs](https://opencv.github.io/cvat/docs/)。

## 许可证

该项目采用 [MIT 许可证](LICENSE) 授权 - 有关详细信息，请参阅 LICENSE 文件。

## 支持

如有任何疑问，请通过以下方式联系我们：
- [GitHub Issues](https://github.com/cvat-ai/cvat/issues)
- [Gitter 聊天室](https://gitter.im/opencv-cvat/community)
