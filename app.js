(() => {
  const $ = (id) => document.getElementById(id);
  const page = document.body.dataset.page;
  const loginPanel = $("login-panel");
  const status = $("login-status");
  $("year").textContent = new Date().getFullYear();

  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
      window.SUPABASE_URL.includes("DEIN-PROJEKT") ||
      window.SUPABASE_ANON_KEY.includes("DEIN_SUPABASE")) {
    if (status) status.textContent = "Bitte zuerst config.js mit deinen Supabase-Zugangsdaten ausfüllen.";
    return;
  }

  const db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  let currentUser = null;

  function setStatus(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", isError);
  }

  function makeAnnouncement(item, admin = false) {
    const article = document.createElement("article");
    article.className = "announcement";
    const meta = document.createElement("div");
    meta.className = "announcement-meta";
    const category = document.createElement("span");
    category.className = "tag";
    category.textContent = item.category || "Allgemein";
    const date = document.createElement("time");
    date.textContent = new Date(item.created_at).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
    meta.append(category, date);
    const title = document.createElement("h3");
    title.textContent = item.title;
    const body = document.createElement("p");
    body.className = "announcement-body";
    body.textContent = item.body;
    article.append(meta, title, body);

    if (admin) {
      const actions = document.createElement("div");
      actions.className = "actions";
      const edit = document.createElement("button");
      edit.className = "button button-small button-quiet";
      edit.textContent = "Bearbeiten";
      edit.addEventListener("click", () => editAnnouncement(item));
      const remove = document.createElement("button");
      remove.className = "button button-small button-danger";
      remove.textContent = "Löschen";
      remove.addEventListener("click", () => deleteAnnouncement(item.id));
      actions.append(edit, remove);
      article.append(actions);
    }
    return article;
  }

  async function loadAnnouncements() {
    const target = page === "admin" ? $("admin-announcements") : $("announcements");
    target.replaceChildren();
    const { data, error } = await db.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Beiträge konnten nicht geladen werden. Bitte prüfe die Datenbank-Einrichtung.";
      target.append(p);
      console.error(error);
      return;
    }
    if (!data.length) {
      const p = document.createElement("p");
      p.className = "muted empty-state";
      p.textContent = "Noch keine Mitteilungen veröffentlicht.";
      target.append(p);
      return;
    }
    data.forEach(item => target.append(makeAnnouncement(item, page === "admin")));
  }

  async function showSession(session) {
    currentUser = session?.user || null;
    $("logout").hidden = !currentUser;
    if (!currentUser) {
      loginPanel.hidden = false;
      if (page === "employee") $("portal").hidden = true;
      if (page === "admin") $("admin-area").hidden = true;
      return;
    }

    const { data: profile, error } = await db.from("profiles").select("role").eq("id", currentUser.id).maybeSingle();
    if (error || !profile) {
      setStatus(status, "Dein Benutzerprofil wurde nicht gefunden. Bitte wende dich an den Administrator.", true);
      await db.auth.signOut();
      return;
    }

    loginPanel.hidden = true;
    if (page === "admin" && profile.role !== "admin") {
      $("admin-area").hidden = true;
      const notice = document.createElement("p");
      notice.className = "notice";
      notice.textContent = "Dein Konto hat keine Admin-Berechtigung. Du kannst das Mitarbeiterportal nutzen.";
      $("login-panel").hidden = false;
      $("login-panel").replaceChildren(notice);
      return;
    }
    if (page === "employee") {
      $("portal").hidden = false;
      $("admin-link").hidden = profile.role !== "admin";
    } else {
      $("admin-area").hidden = false;
    }
    await loadAnnouncements();
  }

  $("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "Anmeldung läuft …");
    const { data, error } = await db.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value
    });
    if (error) return setStatus(status, error.message, true);
    await showSession(data.session);
  });

  $("logout").addEventListener("click", async () => {
    await db.auth.signOut();
    location.reload();
  });

  if (page === "admin") {
    $("post-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      setStatus($("post-status"), "Wird veröffentlicht …");
      const { error } = await db.from("announcements").insert({
        title: $("post-title").value.trim(),
        category: $("post-category").value,
        body: $("post-body").value.trim(),
        author_id: currentUser.id
      });
      button.disabled = false;
      if (error) {
        setStatus($("post-status"), "Veröffentlichung fehlgeschlagen: " + error.message, true);
      } else {
        $("post-form").reset();
        setStatus($("post-status"), "Beitrag wurde veröffentlicht.");
        await loadAnnouncements();
      }
    });
  }

  async function editAnnouncement(item) {
    const title = prompt("Neue Überschrift:", item.title);
    if (title === null) return;
    const body = prompt("Neuer Nachrichtentext:", item.body);
    if (body === null) return;
    const { error } = await db.from("announcements").update({ title: title.trim(), body: body.trim() }).eq("id", item.id);
    if (error) alert("Änderung fehlgeschlagen: " + error.message);
    else loadAnnouncements();
  }

  async function deleteAnnouncement(id) {
    if (!confirm("Diesen Beitrag wirklich löschen?")) return;
    const { error } = await db.from("announcements").delete().eq("id", id);
    if (error) alert("Löschen fehlgeschlagen: " + error.message);
    else loadAnnouncements();
  }

  db.auth.getSession().then(({ data }) => showSession(data.session));
  db.auth.onAuthStateChange((_event, session) => {
    if (!session && currentUser) showSession(null);
  });
})();
