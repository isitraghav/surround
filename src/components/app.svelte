<script>
  import { onMount } from "svelte";
  import { getDevice } from "framework7/lite-bundle";
  import {
    f7,
    f7ready,
    App,
    View,
    Page,
    LoginScreen,
    LoginScreenTitle,
    List,
    ListInput,
    BlockFooter,
    ListButton,
    Block,
    Button,
  } from "framework7-svelte";

  import capacitorApp from "../js/capacitor-app";
  import routes from "../js/routes";
  import locdb, { alert, toast } from "../js/store";
  import { db, user } from "../js/database";

  const device = getDevice();
  // Framework7 Parameters
  let f7params = {
    name: "surround", // App name
    theme: "ios", // Automatic theme detection
    colors: {
      primary: "#5588FF",
    },

    // App routes
    routes: routes,

    // Input settings
    input: {
      scrollIntoViewOnFocus: device.capacitor,
      scrollIntoViewCentered: device.capacitor,
    },
    // Capacitor Statusbar settings
    statusbar: {
      iosOverlaysWebView: true,
      androidOverlaysWebView: false,
    },
  };

  onMount(() => {
    f7ready(() => {
      // Init capacitor APIs (see capacitor-app.js)
      if (f7.device.capacitor) {
        capacitorApp.init(f7);
      }
      // Call F7 APIs here
    });
  });

  let username = "";
  let password = "";

  let loginScreenOpened = true;

  function signIn() {
    f7.dialog.preloader();
    user.auth(username, password, (cb) => {
      if (cb.ack == 2) {
        locdb.create('pair', cb.sea)
        toast("success");
        f7.dialog.close();
      } else {
        toast(cb.err);
        f7.dialog.close();
      }
    });
  }

  function signUp() {
    user.create(username, password, (cb) => {
      if (cb.ok == 0) {
        signIn();
      } else {
        toast(cb.err);
      }
    });
  }

  db.on("auth", () => {
    console.log('logged in');
    loginScreenOpened = false;
  });

  let pair = locdb.get("pair")
  if (pair) {
    user.auth(pair).then((v) => {
      console.log(v);
    });
  }
</script>

<App {...f7params} dark>
  <LoginScreen class="demo-login-screen" opened={loginScreenOpened}>
    <Page loginScreen>
      <LoginScreenTitle>surround</LoginScreenTitle>
      <List form>
        <ListInput
          label="Username"
          type="text"
          placeholder="Your username"
          value={username}
          onInput={(e) => (username = e.target.value)}
        />
        <ListInput
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onInput={(e) => (password = e.target.value)}
        />
      </List>
      <Block>
        <div style="display: flex;justify-content: center;align-items: center;">
          <Button onClick={signIn}>Sign In</Button>
          or
          <Button onClick={signUp}>Sign Up</Button>
        </div>
      </Block>
      <BlockFooter>
        By logging in or signing up, you are agreeing to our terms of service.
      </BlockFooter>
    </Page>
  </LoginScreen>

  <!-- Your main view, should have "view-main" class -->
  <View main class="safe-areas" url="/" />
</App>
