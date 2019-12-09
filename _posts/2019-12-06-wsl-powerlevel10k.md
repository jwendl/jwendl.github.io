---
layout: post
title:  "WSL and Powerlevel 10k"
date:   2019-12-07 11:37:00
categories:
 - Linux
tags:
 - wsl
 - theme
---
Was recently introduced to [PowerLevel10k](https://github.com/romkatv/powerlevel10k) by another co-worker (thank you [Ross](https://www.linkedin.com/in/rosspsmith/)). It's an awesome theme for zsh (and [oh-my-zsh](https://github.com/ohmyzsh/ohmyzsh)) that has a lot of additional information and configuration for the prompts.

After configuring powerlevel10k, this is what my shell ended up with.

![Image of PowerLevel10k](/images/posts/PowerLevel10k.png)

From left to right: On the left section we show what OS we are running, the cwd file path abbreviated (/c/So/G/jwendl...). If you are in a git folder, then the next section shows what the active branch is. On the right side, if we are connected via kubectl to a cluster, it will show the cluster name in the kubectl.conf. Then you can optionally show the time.

THere are a few steps to get all of this to work, but once it's setup the functionality is pretty low maintenance.

First step is to make sure we have oh-my-zsh instead inside WSL.

``` bash
sudo apt install zsh
chsh -s $(which zsh)
```

Then we log out of the shell and re open the shell.

Next we will install the Meslo Nerd Font pack (recommended for PowerLevel10k zsh theme). This is done by going to this [GitHub](https://github.com/romkatv/powerlevel10k#recommended-meslo-nerd-font-patched-for-powerlevel10k) repo and downloading the [MesloLGS NF Regular.ttf](https://github.com/romkatv/dotfiles-public/raw/master/.local/share/fonts/NerdFonts/MesloLGS%20NF%20Regular.ttf) font and clicking on the Install button.

Then we need to set the theme for windows terminal. We can do this by using CTRL + ','.

When the profiles.json (%LocalAppData%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\profiles.json) file opens up, we will edit the entry with the following json.

 ``` json
 "commandline": "wsl.exe -d Ubuntu",
 ```

We will want to make that json to read something similar to the below json block.

``` json
    {
      "acrylicOpacity": 0.5,
      "closeOnExit": true,
      "colorScheme": "Solarized Dark",
      "commandline": "wsl.exe -d Ubuntu",
      "cursorColor": "#FFFFFF",
      "cursorShape": "bar",
      "fontFace": "MesloLGS NF",
      "fontSize": 24,
      "guid": "{2c4de342-38b7-51cf-b940-2309a097f518}",
      "historySize": 9001,
      "icon": "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
      "name": "Ubuntu",
      "padding": "0, 0, 0, 0",
      "snapOnInput": true,
      "useAcrylic": false
    },
```

> The important properties are the fontFace, fontSize and colorScheme.

Then the next steps will be to update our ~/.zshrc file by setting the theme to the new powerlevel10k theme.

``` basah
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
echo "ZSH_THEME=powerlevel10k/powerlevel10k" >> ~/.zshrc
```

The last command to run is the configuration command for PowerLevel10k. This can be done by running the following in the bash shell.

``` bash
p10k configure
```

Once these steps are done then our shell should look something similar to the screen shot above - provided the same configuration options were chosen.
