.class public Luz/agmk/sttb/pto/AgmkIn;
.super Ljava/lang/Object;
.source "AgmkIn.java"

# 5.9 (AGMK-STTB): boshqa ilovadan (Gmail «Открыть в приложении» / «Поделиться») kelgan fayllarni
# JSON qilib olish va saqlangan faylni tizim orqali ochish. Internetga hech narsa yubormaydi.

.method public constructor <init>()V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    return-void
.end method

# grab(Activity, Intent) -> JSON massiv [{name,mime,b64}] yoki null
.method public static grab(Landroid/app/Activity;Landroid/content/Intent;)Ljava/lang/String;
    .locals 14

    const/4 v13, 0x0

    if-nez p1, :cond_has
    return-object v13

    :cond_has
    :try_start_0
    invoke-virtual {p1}, Landroid/content/Intent;->getAction()Ljava/lang/String;
    move-result-object v0
    if-nez v0, :cond_act
    return-object v13

    :cond_act
    new-instance v1, Ljava/util/ArrayList;
    invoke-direct {v1}, Ljava/util/ArrayList;-><init>()V

    const-string v2, "android.intent.action.VIEW"
    invoke-virtual {v2, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v2
    if-eqz v2, :cond_send

    invoke-virtual {p1}, Landroid/content/Intent;->getData()Landroid/net/Uri;
    move-result-object v2
    if-nez v2, :cond_vdata
    return-object v13
    :cond_vdata
    invoke-virtual {v2}, Landroid/net/Uri;->getScheme()Ljava/lang/String;
    move-result-object v3
    const-string v4, "content"
    invoke-virtual {v4, v3}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v4
    if-nez v4, :cond_vok
    const-string v4, "file"
    invoke-virtual {v4, v3}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v4
    if-nez v4, :cond_vok
    return-object v13
    :cond_vok
    invoke-virtual {v1, v2}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z
    goto :goto_read

    :cond_send
    const-string v2, "android.intent.action.SEND"
    invoke-virtual {v2, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v2
    if-eqz v2, :cond_multi
    const-string v2, "android.intent.extra.STREAM"
    invoke-virtual {p1, v2}, Landroid/content/Intent;->getParcelableExtra(Ljava/lang/String;)Landroid/os/Parcelable;
    move-result-object v2
    instance-of v3, v2, Landroid/net/Uri;
    if-eqz v3, :goto_read
    invoke-virtual {v1, v2}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z
    goto :goto_read

    :cond_multi
    const-string v2, "android.intent.action.SEND_MULTIPLE"
    invoke-virtual {v2, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v2
    if-nez v2, :cond_multi_ok
    return-object v13
    :cond_multi_ok
    const-string v2, "android.intent.extra.STREAM"
    invoke-virtual {p1, v2}, Landroid/content/Intent;->getParcelableArrayListExtra(Ljava/lang/String;)Ljava/util/ArrayList;
    move-result-object v2
    if-eqz v2, :goto_read
    invoke-virtual {v1, v2}, Ljava/util/ArrayList;->addAll(Ljava/util/Collection;)Z

    :goto_read
    invoke-virtual {v1}, Ljava/util/ArrayList;->isEmpty()Z
    move-result v2
    if-eqz v2, :cond_go
    return-object v13

    :cond_go
    new-instance v2, Lorg/json/JSONArray;
    invoke-direct {v2}, Lorg/json/JSONArray;-><init>()V
    invoke-virtual {p0}, Landroid/app/Activity;->getContentResolver()Landroid/content/ContentResolver;
    move-result-object v3
    const/4 v4, 0x0

    :loop_top
    invoke-virtual {v1}, Ljava/util/ArrayList;->size()I
    move-result v5
    if-ge v4, v5, :loop_end

    invoke-virtual {v1, v4}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;
    move-result-object v5
    check-cast v5, Landroid/net/Uri;

    # baytlarni oʻqish
    invoke-virtual {v3, v5}, Landroid/content/ContentResolver;->openInputStream(Landroid/net/Uri;)Ljava/io/InputStream;
    move-result-object v6
    new-instance v7, Ljava/io/ByteArrayOutputStream;
    invoke-direct {v7}, Ljava/io/ByteArrayOutputStream;-><init>()V
    const/high16 v8, 0x10000
    new-array v8, v8, [B
    :rd_top
    invoke-virtual {v6, v8}, Ljava/io/InputStream;->read([B)I
    move-result v9
    if-lez v9, :rd_end
    const/4 v10, 0x0
    invoke-virtual {v7, v8, v10, v9}, Ljava/io/ByteArrayOutputStream;->write([BII)V
    goto :rd_top
    :rd_end
    invoke-virtual {v6}, Ljava/io/InputStream;->close()V

    # fayl nomi
    move-object v8, v3
    move-object v9, v5
    const/4 v10, 0x0
    const/4 v11, 0x0
    const/4 v12, 0x0
    const/4 v13, 0x0
    invoke-virtual/range {v8 .. v13}, Landroid/content/ContentResolver;->query(Landroid/net/Uri;[Ljava/lang/String;Ljava/lang/String;[Ljava/lang/String;Ljava/lang/String;)Landroid/database/Cursor;
    move-result-object v11
    const/4 v10, 0x0
    if-eqz v11, :nm_fallback
    invoke-interface {v11}, Landroid/database/Cursor;->moveToFirst()Z
    move-result v12
    if-eqz v12, :nm_close
    const-string v12, "_display_name"
    invoke-interface {v11, v12}, Landroid/database/Cursor;->getColumnIndex(Ljava/lang/String;)I
    move-result v12
    if-ltz v12, :nm_close
    invoke-interface {v11, v12}, Landroid/database/Cursor;->getString(I)Ljava/lang/String;
    move-result-object v10
    :nm_close
    invoke-interface {v11}, Landroid/database/Cursor;->close()V
    :nm_fallback
    if-nez v10, :nm_ok
    invoke-virtual {v5}, Landroid/net/Uri;->getLastPathSegment()Ljava/lang/String;
    move-result-object v10
    if-nez v10, :nm_ok
    const-string v10, "fayl"
    :nm_ok

    # turi
    invoke-virtual {v3, v5}, Landroid/content/ContentResolver;->getType(Landroid/net/Uri;)Ljava/lang/String;
    move-result-object v11
    if-nez v11, :mt_ok
    const-string v11, ""
    :mt_ok

    new-instance v12, Lorg/json/JSONObject;
    invoke-direct {v12}, Lorg/json/JSONObject;-><init>()V
    const-string v6, "name"
    invoke-virtual {v12, v6, v10}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    const-string v6, "mime"
    invoke-virtual {v12, v6, v11}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    invoke-virtual {v7}, Ljava/io/ByteArrayOutputStream;->toByteArray()[B
    move-result-object v6
    const/4 v9, 0x2
    invoke-static {v6, v9}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;
    move-result-object v6
    const-string v9, "b64"
    invoke-virtual {v12, v9, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    invoke-virtual {v2, v12}, Lorg/json/JSONArray;->put(Ljava/lang/Object;)Lorg/json/JSONArray;

    add-int/lit8 v4, v4, 0x1
    goto :loop_top

    :loop_end
    invoke-virtual {v2}, Lorg/json/JSONArray;->toString()Ljava/lang/String;
    move-result-object v0
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0
    return-object v0

    :catch_0
    move-exception v0
    return-object v13
.end method

# openUri(Activity, uri, mime) -> true: ochildi; false: fayl topilmadi
.method public static openUri(Landroid/app/Activity;Ljava/lang/String;Ljava/lang/String;)Z
    .locals 4

    :try_start_0
    invoke-static {p1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;
    move-result-object v0
    invoke-virtual {p0}, Landroid/app/Activity;->getContentResolver()Landroid/content/ContentResolver;
    move-result-object v1
    invoke-virtual {v1, v0}, Landroid/content/ContentResolver;->openInputStream(Landroid/net/Uri;)Ljava/io/InputStream;
    move-result-object v1
    invoke-virtual {v1}, Ljava/io/InputStream;->close()V
    new-instance v1, Landroid/content/Intent;
    const-string v2, "android.intent.action.VIEW"
    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V
    invoke-virtual {v1, v0, p2}, Landroid/content/Intent;->setDataAndType(Landroid/net/Uri;Ljava/lang/String;)Landroid/content/Intent;
    const v2, 0x10000001
    invoke-virtual {v1, v2}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;
    const-string v2, "Ochish"
    invoke-static {v1, v2}, Landroid/content/Intent;->createChooser(Landroid/content/Intent;Ljava/lang/CharSequence;)Landroid/content/Intent;
    move-result-object v1
    const/high16 v2, 0x10000000
    invoke-virtual {v1, v2}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;
    invoke-virtual {p0, v1}, Landroid/app/Activity;->startActivity(Landroid/content/Intent;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0
    const/4 v0, 0x1
    return v0

    :catch_0
    move-exception v0
    const/4 v0, 0x0
    return v0
.end method
