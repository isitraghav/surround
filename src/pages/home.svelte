<script>
  import {
    f7,
    Navbar,
    Page,
    LoginScreen,
    ListInput,
    List,
    ListItem,
    Block,
    Button,
    LoginScreenTitle,
    BlockFooter,
    ListButton,
    BlockTitle,
    BlockHeader,
  } from "framework7-svelte";

  import { Geolocation } from "@capacitor/geolocation";
  import { alert } from "../js/store";
  import { db, user } from "../js/database";

  let locationpermission = false;
  const requestPermission = async () => {
    await Geolocation.getCurrentPosition()
      .catch((err) => {
        if (err.message !== "Timeout expired") {
          alert(err.message);
        }
        locationpermission = false;
      })
      .then((val) => {
        locationpermission = true;
        synclocation();
      });
  };

  let users_pub = [];
  let users = [];
  function renderlist() {
    users = [];

    let seen = new Set();
    users_pub = users_pub.filter((el) => {
      const duplicate = seen.has(el.id);
      seen.add(el.id);
      return !duplicate;
    });

    users_pub.forEach((user) => {
      db.get(`~${user}`)
        .get("alias")
        .once((data) => {
          users = [
            ...users,
            {
              name: data,
              pub: user,
            },
          ];
        });
    });
  }
  $: users_pub, renderlist();

  let poskey = "";
  async function synclocation() {
    if (locationpermission) {
      console.log("enabled sync");
      await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        async (pos, err) => {
          if (err) {
            console.log(err);
            requestPermission();
          } else {
            poskey = `${pos.coords.latitude.toFixed(4)}-${pos.coords.longitude.toFixed(4)}`;

            await db
              .get("world")
              .get(poskey)
              .once((data) => {
                if (data) {
                  console.log(data);
                  users_pub = [];
                  delete data._;
                  Object.entries(data).forEach((e) => {
                    console.log(e[1]);
                    users_pub = [...users_pub, e[1]];
                  });
                }
              });

            db.get("world")
              .get(poskey)
              .once((data) => {
                console.log(data);
              });

            db.get("world")
              .get(poskey)
              .get(`${pos.coords.latitude}-${pos.coords.longitude}`)
              .put(user.is.pub);
          }
        }
      );
    }
  }

  async function init() {
    await Geolocation.checkPermissions().then((val) => {
      if (val.location == "granted") {
        locationpermission = true;
        synclocation();
      } else {
        locationpermission = false;
      }
    });
  }

  init();
</script>

<Page>
  <Navbar title="surround" />

  {#if !locationpermission}
    <Block>
      <BlockHeader>
        <div>You haven't allowed location access to the application</div>
        <div>
          <Button on:click={requestPermission}>allow location</Button>
        </div>
      </BlockHeader>
    </Block>
  {/if}

  <Block>
    <BlockTitle>Nearby Friends</BlockTitle>
    {#if locationpermission}
      <List>
        {#each users as u}
          <ListItem link={`/message/${u.pub}`} title={u.name}
            ><i slot="media" class="icon icon-f7" /></ListItem
          >
        {/each}
      </List>
    {/if}
  </Block>
</Page>
