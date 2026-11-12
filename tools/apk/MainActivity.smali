.class public Luz/agmk/sttb/pto/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Luz/agmk/sttb/pto/MainActivity$Bridge;,
        Luz/agmk/sttb/pto/MainActivity$Client;,
        Luz/agmk/sttb/pto/MainActivity$Chrome;
    }
.end annotation


# static fields
.field static final HOST:Ljava/lang/String; = "appassets.androidplatform.net"

.field static final REQ_FILE:I = 0xb

.field static final REQ_GEO:I = 0x16

.field static final REQ_MIC:I = 0x15

.field static final REQ_STORAGE:I = 0x18

.field static final REQ_WEBMIC:I = 0x17

.field static final START:Ljava/lang/String; = "https://appassets.androidplatform.net/assets/index.html"


# instance fields
.field afterMicGrant:Ljava/lang/Runnable;

.field camUri:Landroid/net/Uri;

.field fileCb:Landroid/webkit/ValueCallback;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroid/webkit/ValueCallback",
            "<[",
            "Landroid/net/Uri;",
            ">;"
        }
    .end annotation
.end field

.field geoCb:Landroid/webkit/GeolocationPermissions$Callback;

.field geoOrigin:Ljava/lang/String;

.field kwsHolds:I

.field kwsObj:Luz/agmk/sttb/pto/Kws;

.field kwsTesting:Z

.field kwsWanted:Z

.field lastBack:J

.field micDeniedFor:I

.field muted:Z

.field pendingIn:Ljava/lang/String;

.field pendingSave:[Ljava/lang/String;

.field pendingWebPerm:Landroid/webkit/PermissionRequest;

.field printView:Landroid/webkit/WebView;

.field resumed:Z

.field sr:Landroid/speech/SpeechRecognizer;

.field srContinuous:Z

.field srGoogleCache:Landroid/content/ComponentName;

.field srGoogleChecked:Z

.field srId:I

.field srOn:Z

.field srQuiet:Z

.field srSilenceMs:I

.field tts:Landroid/speech/tts/TextToSpeech;

.field final ttsQueue:Ljava/util/ArrayList;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/ArrayList",
            "<[",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation
.end field

.field ttsReady:Z

.field ui:Landroid/os/Handler;

.field web:Landroid/webkit/WebView;


# direct methods
.method public constructor <init>()V
    .locals 3

    .prologue
    const/4 v2, 0x0

    .line 62
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    .line 68
    new-instance v0, Landroid/os/Handler;

    invoke-static {}, Landroid/os/Looper;->getMainLooper()Landroid/os/Looper;

    move-result-object v1

    invoke-direct {v0, v1}, Landroid/os/Handler;-><init>(Landroid/os/Looper;)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    .line 72
    iput v2, p0, Luz/agmk/sttb/pto/MainActivity;->micDeniedFor:I

    .line 73
    iput v2, p0, Luz/agmk/sttb/pto/MainActivity;->srId:I

    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->srContinuous:Z

    .line 74
    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->ttsReady:Z

    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ttsQueue:Ljava/util/ArrayList;

    .line 76
    const-wide/16 v0, 0x0

    iput-wide v0, p0, Luz/agmk/sttb/pto/MainActivity;->lastBack:J

    .line 476
    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->srQuiet:Z

    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->muted:Z

    const/16 v0, 0xbb8

    iput v0, p0, Luz/agmk/sttb/pto/MainActivity;->srSilenceMs:I

    .line 478
    const/4 v0, 0x0

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleCache:Landroid/content/ComponentName;

    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleChecked:Z

    .line 706
    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->kwsWanted:Z

    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->kwsTesting:Z

    const/4 v0, 0x1

    iput-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->resumed:Z

    iput v2, p0, Luz/agmk/sttb/pto/MainActivity;->kwsHolds:I

    .line 711
    iput-boolean v2, p0, Luz/agmk/sttb/pto/MainActivity;->srOn:Z

    return-void
.end method

.method static certSha256(Landroid/net/http/SslCertificate;)Ljava/lang/String;
    .locals 10

    .prologue
    const/4 v1, 0x0

    const/4 v0, 0x0

    .line 204
    .line 205
    :try_start_0
    sget v2, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v3, 0x1d

    if-lt v2, v3, :cond_3

    invoke-virtual {p0}, Landroid/net/http/SslCertificate;->getX509Certificate()Ljava/security/cert/X509Certificate;

    move-result-object v2

    if-eqz v2, :cond_3

    invoke-virtual {v2}, Ljava/security/cert/X509Certificate;->getEncoded()[B

    move-result-object v2

    .line 206
    :goto_0
    if-nez v2, :cond_0

    invoke-static {p0}, Landroid/net/http/SslCertificate;->saveState(Landroid/net/http/SslCertificate;)Landroid/os/Bundle;

    move-result-object v3

    if-eqz v3, :cond_0

    const-string v2, "x509-certificate"

    invoke-virtual {v3, v2}, Landroid/os/Bundle;->getByteArray(Ljava/lang/String;)[B

    move-result-object v2

    .line 207
    :cond_0
    if-nez v2, :cond_1

    .line 210
    :goto_1
    return-object v0

    .line 208
    :cond_1
    const-string v3, "SHA-256"

    invoke-static {v3}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;

    move-result-object v3

    invoke-virtual {v3, v2}, Ljava/security/MessageDigest;->digest([B)[B

    move-result-object v2

    .line 209
    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    array-length v4, v2

    :goto_2
    if-ge v1, v4, :cond_2

    aget-byte v5, v2, v1

    sget-object v6, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    const-string v7, "%02x"

    const/4 v8, 0x1

    new-array v8, v8, [Ljava/lang/Object;

    const/4 v9, 0x0

    and-int/lit16 v5, v5, 0xff

    invoke-static {v5}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v5

    aput-object v5, v8, v9

    invoke-static {v6, v7, v8}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v5

    invoke-virtual {v3, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    add-int/lit8 v1, v1, 0x1

    goto :goto_2

    :cond_2
    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    move-result-object v0

    goto :goto_1

    .line 210
    :catch_0
    move-exception v1

    goto :goto_1

    :cond_3
    move-object v2, v0

    goto :goto_0
.end method

.method static extMime(Ljava/lang/String;)Ljava/lang/String;
    .locals 2

    .prologue
    .line 335
    sget-object v0, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {p0, v0}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v0

    .line 336
    const-string v1, ".json"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_0

    const-string v0, "application/json"

    .line 344
    :goto_0
    return-object v0

    .line 337
    :cond_0
    const-string v1, ".pdf"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_1

    const-string v0, "application/pdf"

    goto :goto_0

    .line 338
    :cond_1
    const-string v1, ".txt"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_2

    const-string v0, "text/plain"

    goto :goto_0

    .line 339
    :cond_2
    const-string v1, ".heic"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_3

    const-string v0, "image/heic"

    goto :goto_0

    .line 340
    :cond_3
    const-string v1, ".heif"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_4

    const-string v0, "image/heif"

    goto :goto_0

    .line 341
    :cond_4
    const-string v1, ".xls"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_5

    const-string v0, "application/vnd.ms-excel"

    goto :goto_0

    .line 342
    :cond_5
    const-string v1, ".xlsx"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_6

    const-string v0, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    goto :goto_0

    .line 343
    :cond_6
    const-string v1, ".csv"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_7

    const-string v0, "text/csv"

    goto :goto_0

    .line 344
    :cond_7
    const/4 v0, 0x0

    goto :goto_0
.end method

.method static mime(Ljava/lang/String;)Ljava/lang/String;
    .locals 2

    .prologue
    .line 214
    sget-object v0, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {p0, v0}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v0

    .line 215
    const-string v1, ".html"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-nez v1, :cond_0

    const-string v1, ".htm"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_1

    :cond_0
    const-string v0, "text/html"

    .line 223
    :goto_0
    return-object v0

    .line 216
    :cond_1
    const-string v1, ".js"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_2

    const-string v0, "text/javascript"

    goto :goto_0

    .line 217
    :cond_2
    const-string v1, ".css"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_3

    const-string v0, "text/css"

    goto :goto_0

    .line 218
    :cond_3
    const-string v1, ".json"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_4

    const-string v0, "application/json"

    goto :goto_0

    .line 219
    :cond_4
    const-string v1, ".png"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_5

    const-string v0, "image/png"

    goto :goto_0

    .line 220
    :cond_5
    const-string v1, ".jpg"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-nez v1, :cond_6

    const-string v1, ".jpeg"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_7

    :cond_6
    const-string v0, "image/jpeg"

    goto :goto_0

    .line 221
    :cond_7
    const-string v1, ".svg"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v1

    if-eqz v1, :cond_8

    const-string v0, "image/svg+xml"

    goto :goto_0

    .line 222
    :cond_8
    const-string v1, ".webp"

    invoke-virtual {v0, v1}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_9

    const-string v0, "image/webp"

    goto :goto_0

    .line 223
    :cond_9
    const-string v0, "application/octet-stream"

    goto :goto_0
.end method


# virtual methods
.method cameraIntent()Landroid/content/Intent;
    .locals 6

    .prologue
    const/4 v0, 0x0

    const-string v1, "android.permission.CAMERA"

    invoke-virtual {p0, v1}, Luz/agmk/sttb/pto/MainActivity;->has(Ljava/lang/String;)Z

    move-result v2

    if-nez v2, :cond_0

    const/4 v2, 0x1

    new-array v2, v2, [Ljava/lang/String;

    const/4 v3, 0x0

    aput-object v1, v2, v3

    const/16 v3, 0x18

    invoke-virtual {p0, v2, v3}, Luz/agmk/sttb/pto/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    return-object v0

    .line 312
    :cond_0
    :try_start_0
    new-instance v1, Landroid/content/Intent;

    const-string v2, "android.media.action.IMAGE_CAPTURE"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .line 313
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v2

    invoke-virtual {v1, v2}, Landroid/content/Intent;->resolveActivity(Landroid/content/pm/PackageManager;)Landroid/content/ComponentName;

    move-result-object v2

    if-nez v2, :cond_2

    sget v2, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v3, 0x1e

    if-ge v2, v3, :cond_2

    .line 331
    :cond_1
    :goto_0
    return-object v0

    .line 314
    :cond_2
    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "AGMK_"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v4

    invoke-virtual {v2, v4, v5}, Ljava/lang/StringBuilder;->append(J)Ljava/lang/StringBuilder;

    move-result-object v2

    const-string v3, ".jpg"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    .line 316
    sget v2, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v4, 0x1d

    if-lt v2, v4, :cond_3

    .line 317
    new-instance v2, Landroid/content/ContentValues;

    invoke-direct {v2}, Landroid/content/ContentValues;-><init>()V

    .line 318
    const-string v4, "_display_name"

    invoke-virtual {v2, v4, v3}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 319
    const-string v3, "mime_type"

    const-string v4, "image/jpeg"

    invoke-virtual {v2, v3, v4}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 320
    const-string v3, "relative_path"

    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    sget-object v5, Landroid/os/Environment;->DIRECTORY_PICTURES:Ljava/lang/String;

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    const-string v5, "/AGMK-STTB"

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v2, v3, v4}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 321
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v3

    sget-object v4, Landroid/provider/MediaStore$Images$Media;->EXTERNAL_CONTENT_URI:Landroid/net/Uri;

    invoke-virtual {v3, v4, v2}, Landroid/content/ContentResolver;->insert(Landroid/net/Uri;Landroid/content/ContentValues;)Landroid/net/Uri;

    move-result-object v2

    .line 326
    :goto_1
    if-eqz v2, :cond_1

    .line 327
    iput-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    .line 328
    const-string v3, "output"

    invoke-virtual {v1, v3, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Landroid/os/Parcelable;)Landroid/content/Intent;

    .line 329
    const/4 v2, 0x3

    invoke-virtual {v1, v2}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;

    move-object v0, v1

    .line 330
    goto :goto_0

    .line 323
    :cond_3
    new-instance v4, Ljava/io/File;

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getExternalCacheDir()Ljava/io/File;

    move-result-object v2

    if-eqz v2, :cond_4

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getExternalCacheDir()Ljava/io/File;

    move-result-object v2

    :goto_2
    const-string v5, "camera"

    invoke-direct {v4, v2, v5}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {v4}, Ljava/io/File;->mkdirs()Z

    .line 324
    new-instance v2, Ljava/io/File;

    invoke-direct {v2, v4, v3}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-static {v2}, Landroid/net/Uri;->fromFile(Ljava/io/File;)Landroid/net/Uri;

    move-result-object v2

    goto :goto_1

    .line 323
    :cond_4
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getCacheDir()Ljava/io/File;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    move-result-object v2

    goto :goto_2

    .line 331
    :catch_0
    move-exception v1

    goto/16 :goto_0
.end method

.method deepUrl()Ljava/lang/String;
    .locals 4

    const-string v0, "https://appassets.androidplatform.net/assets/index.html"

    invoke-virtual {p0}, Landroid/app/Activity;->getIntent()Landroid/content/Intent;

    move-result-object v1

    if-eqz v1, :cond_0

    invoke-virtual {v1}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v2

    if-eqz v2, :cond_0

    invoke-virtual {v2}, Landroid/net/Uri;->getScheme()Ljava/lang/String;

    move-result-object v2

    const-string v3, "agmk"

    invoke-virtual {v3, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v3

    if-eqz v3, :cond_0

    invoke-virtual {v1}, Landroid/content/Intent;->getDataString()Ljava/lang/String;

    move-result-object v1

    if-eqz v1, :cond_0

    invoke-static {v1}, Landroid/net/Uri;->encode(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v0, "#agmk="

    invoke-virtual {v2, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    :cond_0
    return-object v0
.end method

.method doPrint(Ljava/lang/String;Ljava/lang/String;)V
    .locals 6

    .prologue
    .line 625
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->printView:Landroid/webkit/WebView;

    if-eqz v0, :cond_0

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->printView:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->destroy()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .line 626
    :cond_0
    :goto_0
    new-instance v0, Landroid/webkit/WebView;

    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->printView:Landroid/webkit/WebView;

    .line 627
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->printView:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object v0

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V

    .line 628
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->printView:Landroid/webkit/WebView;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$11;

    invoke-direct {v1, p0, p2}, Luz/agmk/sttb/pto/MainActivity$11;-><init>(Luz/agmk/sttb/pto/MainActivity;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    .line 641
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->printView:Landroid/webkit/WebView;

    const-string v1, "https://appassets.androidplatform.net/assets/index.html"

    const-string v3, "text/html"

    const-string v4, "utf-8"

    const/4 v5, 0x0

    move-object v2, p1

    invoke-virtual/range {v0 .. v5}, Landroid/webkit/WebView;->loadDataWithBaseURL(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V

    .line 642
    return-void

    .line 625
    :catch_0
    move-exception v0

    goto :goto_0
.end method

.method doSave(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V
    .locals 6

    .prologue
    .line 589
    const/4 v0, 0x0

    :try_start_0
    invoke-static {p3, v0}, Landroid/util/Base64;->decode(Ljava/lang/String;I)[B

    move-result-object v1

    .line 590
    const-string v0, "[\\\\/:*?\"<>|]"

    const-string v2, "_"

    invoke-virtual {p1, v0, v2}, Ljava/lang/String;->replaceAll(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    .line 592
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v3, 0x1d

    if-lt v0, v3, :cond_2

    .line 593
    new-instance v0, Landroid/content/ContentValues;

    invoke-direct {v0}, Landroid/content/ContentValues;-><init>()V

    .line 594
    const-string v3, "_display_name"

    invoke-virtual {v0, v3, v2}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 595
    const-string v3, "mime_type"

    invoke-virtual {v0, v3, p2}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 596
    const-string v3, "relative_path"

    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    sget-object v5, Landroid/os/Environment;->DIRECTORY_DOWNLOADS:Ljava/lang/String;

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    const-string v5, "/AGMK-STTB"

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v0, v3, v4}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 597
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v3

    .line 598
    sget-object v4, Landroid/provider/MediaStore$Downloads;->EXTERNAL_CONTENT_URI:Landroid/net/Uri;

    invoke-virtual {v3, v4, v0}, Landroid/content/ContentResolver;->insert(Landroid/net/Uri;Landroid/content/ContentValues;)Landroid/net/Uri;

    move-result-object v0

    .line 599
    if-nez v0, :cond_1

    new-instance v0, Ljava/lang/Exception;

    const-string v1, "insert"

    invoke-direct {v0, v1}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    throw v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .line 620
    :catch_0
    move-exception v0

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "Faylni saqlab bo\'lmadi: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v0}, Ljava/lang/Exception;->getMessage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    .line 621
    :cond_0
    :goto_0
    return-void

    .line 600
    :cond_1
    :try_start_1
    invoke-virtual {v3, v0}, Landroid/content/ContentResolver;->openOutputStream(Landroid/net/Uri;)Ljava/io/OutputStream;

    move-result-object v3

    invoke-virtual {v3, v1}, Ljava/io/OutputStream;->write([B)V

    invoke-virtual {v3}, Ljava/io/OutputStream;->close()V

    .line 612
    :goto_1
    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "\u2705 Saqlandi: Yuklanmalar/AGMK-STTB/"

    invoke-virtual {v1, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {p0, v1}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "try{agmkSaved("

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-static {v2}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v4, ","

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Landroid/net/Uri;->toString()Ljava/lang/String;

    move-result-object v4

    invoke-static {v4}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v4, ")}catch(e){}"

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {p0, v3}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V

    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    .line 613
    if-eqz p4, :cond_0

    .line 615
    :try_start_2
    new-instance v1, Landroid/content/Intent;

    const-string v2, "android.intent.action.VIEW"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, v0, p2}, Landroid/content/Intent;->setDataAndType(Landroid/net/Uri;Ljava/lang/String;)Landroid/content/Intent;

    .line 616
    const v0, 0x10000001

    invoke-virtual {v1, v0}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;

    .line 617
    const-string v0, "Ochish"

    invoke-static {v1, v0}, Landroid/content/Intent;->createChooser(Landroid/content/Intent;Ljava/lang/CharSequence;)Landroid/content/Intent;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->startActivity(Landroid/content/Intent;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_1

    goto :goto_0

    .line 618
    :catch_1
    move-exception v0

    goto :goto_0

    .line 602
    :cond_2
    :try_start_3
    const-string v0, "android.permission.WRITE_EXTERNAL_STORAGE"

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->has(Ljava/lang/String;)Z

    move-result v0

    if-nez v0, :cond_4

    .line 603
    const/4 v0, 0x4

    new-array v1, v0, [Ljava/lang/String;

    const/4 v0, 0x0

    aput-object v2, v1, v0

    const/4 v0, 0x1

    aput-object p2, v1, v0

    const/4 v0, 0x2

    aput-object p3, v1, v0

    const/4 v2, 0x3

    if-eqz p4, :cond_3

    const-string v0, "1"

    :goto_2
    aput-object v0, v1, v2

    iput-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->pendingSave:[Ljava/lang/String;

    .line 604
    const/4 v0, 0x1

    new-array v0, v0, [Ljava/lang/String;

    const/4 v1, 0x0

    const-string v2, "android.permission.WRITE_EXTERNAL_STORAGE"

    aput-object v2, v0, v1

    const/16 v1, 0x18

    invoke-virtual {p0, v0, v1}, Luz/agmk/sttb/pto/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    goto :goto_0

    .line 603
    :cond_3
    const-string v0, "0"

    goto :goto_2

    .line 606
    :cond_4
    new-instance v0, Ljava/io/File;

    sget-object v3, Landroid/os/Environment;->DIRECTORY_DOWNLOADS:Ljava/lang/String;

    invoke-static {v3}, Landroid/os/Environment;->getExternalStoragePublicDirectory(Ljava/lang/String;)Ljava/io/File;

    move-result-object v3

    const-string v4, "AGMK-STTB"

    invoke-direct {v0, v3, v4}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    .line 607
    invoke-virtual {v0}, Ljava/io/File;->mkdirs()Z

    .line 608
    new-instance v3, Ljava/io/File;

    invoke-direct {v3, v0, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    .line 609
    new-instance v0, Ljava/io/FileOutputStream;

    invoke-direct {v0, v3}, Ljava/io/FileOutputStream;-><init>(Ljava/io/File;)V

    invoke-virtual {v0, v1}, Ljava/io/FileOutputStream;->write([B)V

    invoke-virtual {v0}, Ljava/io/FileOutputStream;->close()V

    .line 610
    invoke-static {v3}, Landroid/net/Uri;->fromFile(Ljava/io/File;)Landroid/net/Uri;
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_0

    move-result-object v0

    goto/16 :goto_1
.end method

.method doShare(Ljava/lang/String;)V
    .locals 17

    .prologue
    .line 526
    :try_start_0
    new-instance v1, Lorg/json/JSONObject;

    move-object/from16 v0, p1

    invoke-direct {v1, v0}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    .line 527
    const-string v2, "files"

    invoke-virtual {v1, v2}, Lorg/json/JSONObject;->optJSONArray(Ljava/lang/String;)Lorg/json/JSONArray;

    move-result-object v5

    .line 528
    const-string v2, "via"

    const-string v3, "any"

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    const-string v2, "subject"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v7

    const-string v2, "text"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v8

    const-string v2, "email"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v9

    const-string v2, "tg"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v10

    const-string v2, "phone"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v11

    const-string v2, "name"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    .line 529
    new-instance v12, Ljava/util/ArrayList;

    invoke-direct {v12}, Ljava/util/ArrayList;-><init>()V

    const/4 v1, 0x0

    .line 530
    if-eqz v5, :cond_3

    const/4 v4, 0x0

    move-object v2, v1

    :goto_0
    invoke-virtual {v5}, Lorg/json/JSONArray;->length()I

    move-result v1

    if-ge v4, v1, :cond_2

    .line 531
    invoke-virtual {v5, v4}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v13

    .line 532
    const-string v1, "mime"

    const-string v14, "application/octet-stream"

    invoke-virtual {v13, v1, v14}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    .line 533
    const-string v14, "name"

    const-string v15, "fayl"

    invoke-virtual {v13, v14, v15}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v14

    const-string v15, "b64"

    const-string v16, ""

    move-object/from16 v0, v16

    invoke-virtual {v13, v15, v0}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v13

    const/4 v15, 0x0

    invoke-static {v13, v15}, Landroid/util/Base64;->decode(Ljava/lang/String;I)[B

    move-result-object v13

    move-object/from16 v0, p0

    invoke-virtual {v0, v14, v1, v13}, Luz/agmk/sttb/pto/MainActivity;->writeShare(Ljava/lang/String;Ljava/lang/String;[B)Landroid/net/Uri;

    move-result-object v13

    invoke-virtual {v12, v13}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    .line 534
    if-nez v2, :cond_0

    .line 530
    :goto_1
    add-int/lit8 v4, v4, 0x1

    move-object v2, v1

    goto :goto_0

    .line 534
    :cond_0
    invoke-virtual {v2, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_1

    move-object v1, v2

    goto :goto_1

    :cond_1
    const-string v1, "*/*"

    goto :goto_1

    :cond_2
    move-object v1, v2

    .line 536
    :cond_3
    const-string v2, "sms"

    invoke-virtual {v2, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_4

    invoke-virtual {v12}, Ljava/util/ArrayList;->isEmpty()Z

    move-result v2

    if-eqz v2, :cond_4

    new-instance v1, Landroid/content/Intent;

    const-string v2, "android.intent.action.SENDTO"

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "smsto:"

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    invoke-virtual {v3, v11}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-static {v3}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v3

    invoke-direct {v1, v2, v3}, Landroid/content/Intent;-><init>(Ljava/lang/String;Landroid/net/Uri;)V

    const-string v2, "sms_body"

    invoke-virtual {v1, v2, v8}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    move-object/from16 v0, p0

    invoke-virtual {v0, v1}, Luz/agmk/sttb/pto/MainActivity;->startActivity(Landroid/content/Intent;)V

    .line 554
    :goto_2
    return-void

    .line 537
    :cond_4
    new-instance v4, Landroid/content/Intent;

    invoke-virtual {v12}, Ljava/util/ArrayList;->size()I

    move-result v2

    const/4 v5, 0x1

    if-le v2, v5, :cond_c

    const-string v2, "android.intent.action.SEND_MULTIPLE"

    :goto_3
    invoke-direct {v4, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .line 538
    if-nez v1, :cond_5

    const-string v1, "text/plain"

    :cond_5
    invoke-virtual {v4, v1}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    .line 539
    invoke-virtual {v12}, Ljava/util/ArrayList;->size()I

    move-result v1

    const/4 v2, 0x1

    if-ne v1, v2, :cond_d

    const-string v2, "android.intent.extra.STREAM"

    const/4 v1, 0x0

    invoke-virtual {v12, v1}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Landroid/os/Parcelable;

    invoke-virtual {v4, v2, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Landroid/os/Parcelable;)Landroid/content/Intent;

    .line 540
    :cond_6
    :goto_4
    const-string v1, "android.intent.extra.SUBJECT"

    invoke-virtual {v4, v1, v7}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    const-string v1, "android.intent.extra.TEXT"

    invoke-virtual {v4, v1, v8}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    .line 541
    invoke-virtual {v9}, Ljava/lang/String;->length()I

    move-result v1

    if-lez v1, :cond_7

    const-string v1, "android.intent.extra.EMAIL"

    const/4 v2, 0x1

    new-array v2, v2, [Ljava/lang/String;

    const/4 v5, 0x0

    aput-object v9, v2, v5

    invoke-virtual {v4, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;[Ljava/lang/String;)Landroid/content/Intent;

    .line 542
    :cond_7
    const/4 v1, 0x1

    invoke-virtual {v4, v1}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;

    .line 543
    invoke-virtual {v12}, Ljava/util/ArrayList;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_8

    const-string v2, ""

    const/4 v1, 0x0

    invoke-virtual {v12, v1}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Landroid/net/Uri;

    invoke-static {v2, v1}, Landroid/content/ClipData;->newRawUri(Ljava/lang/CharSequence;Landroid/net/Uri;)Landroid/content/ClipData;

    move-result-object v1

    invoke-virtual {v4, v1}, Landroid/content/Intent;->setClipData(Landroid/content/ClipData;)V

    .line 544
    :cond_8
    const/4 v1, 0x0

    .line 545
    const-string v2, "telegram"

    invoke-virtual {v2, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_10

    const-string v2, "org.telegram.messenger"

    move-object/from16 v0, p0

    invoke-virtual {v0, v2}, Luz/agmk/sttb/pto/MainActivity;->hasPkg(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_e

    const-string v1, "org.telegram.messenger"

    .line 547
    :cond_9
    :goto_5
    if-eqz v1, :cond_b

    .line 548
    invoke-virtual {v4, v1}, Landroid/content/Intent;->setPackage(Ljava/lang/String;)Landroid/content/Intent;

    .line 549
    const-string v1, "telegram"

    invoke-virtual {v1, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_a

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "Telegram\'da "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v3}, Ljava/lang/String;->length()I

    move-result v1

    if-lez v1, :cond_11

    move-object v1, v3

    :goto_6
    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v10}, Ljava/lang/String;->length()I

    move-result v1

    if-lez v1, :cond_12

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, " ("

    invoke-virtual {v1, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1, v10}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v3, ")"

    invoke-virtual {v1, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    :goto_7
    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, " ni tanlang va yuboring"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    move-object/from16 v0, p0

    invoke-virtual {v0, v1}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    .line 550
    :cond_a
    :try_start_1
    move-object/from16 v0, p0

    invoke-virtual {v0, v4}, Luz/agmk/sttb/pto/MainActivity;->startActivity(Landroid/content/Intent;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    goto/16 :goto_2

    :catch_0
    move-exception v1

    const/4 v1, 0x0

    :try_start_2
    invoke-virtual {v4, v1}, Landroid/content/Intent;->setPackage(Ljava/lang/String;)Landroid/content/Intent;

    .line 552
    :cond_b
    const-string v1, "Yuborish"

    invoke-static {v4, v1}, Landroid/content/Intent;->createChooser(Landroid/content/Intent;Ljava/lang/CharSequence;)Landroid/content/Intent;

    move-result-object v1

    move-object/from16 v0, p0

    invoke-virtual {v0, v1}, Luz/agmk/sttb/pto/MainActivity;->startActivity(Landroid/content/Intent;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_1

    goto/16 :goto_2

    .line 553
    :catch_1
    move-exception v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "Yuborib bo\'lmadi: "

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v1}, Ljava/lang/Exception;->getMessage()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    move-object/from16 v0, p0

    invoke-virtual {v0, v1}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    goto/16 :goto_2

    .line 537
    :cond_c
    :try_start_3
    const-string v2, "android.intent.action.SEND"

    goto/16 :goto_3

    .line 539
    :cond_d
    invoke-virtual {v12}, Ljava/util/ArrayList;->size()I

    move-result v1

    const/4 v2, 0x1

    if-le v1, v2, :cond_6

    const-string v1, "android.intent.extra.STREAM"

    invoke-virtual {v4, v1, v12}, Landroid/content/Intent;->putParcelableArrayListExtra(Ljava/lang/String;Ljava/util/ArrayList;)Landroid/content/Intent;

    goto/16 :goto_4

    .line 545
    :cond_e
    const-string v2, "org.telegram.messenger.web"

    move-object/from16 v0, p0

    invoke-virtual {v0, v2}, Luz/agmk/sttb/pto/MainActivity;->hasPkg(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_f

    const-string v1, "org.telegram.messenger.web"

    goto/16 :goto_5

    :cond_f
    const-string v2, "Telegram o\'rnatilmagan \u2014 boshqa ilovani tanlang"

    move-object/from16 v0, p0

    invoke-virtual {v0, v2}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    goto/16 :goto_5

    .line 546
    :cond_10
    const-string v2, "email"

    invoke-virtual {v2, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_9

    const-string v2, "com.google.android.gm"

    move-object/from16 v0, p0

    invoke-virtual {v0, v2}, Luz/agmk/sttb/pto/MainActivity;->hasPkg(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_9

    const-string v1, "com.google.android.gm"

    goto/16 :goto_5

    .line 549
    :cond_11
    const-string v1, "qabul qiluvchi"

    goto/16 :goto_6

    :cond_12
    const-string v1, ""
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_1

    goto/16 :goto_7
.end method

.method handleBack()V
    .locals 3

    .prologue
    .line 391
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    const-string v1, "(window.agmkBack&&agmkBack())?\'1\':\'0\'"

    new-instance v2, Luz/agmk/sttb/pto/MainActivity$7;

    invoke-direct {v2, p0}, Luz/agmk/sttb/pto/MainActivity$7;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-virtual {v0, v1, v2}, Landroid/webkit/WebView;->evaluateJavascript(Ljava/lang/String;Landroid/webkit/ValueCallback;)V

    .line 399
    return-void
.end method

.method has(Ljava/lang/String;)Z
    .locals 1

    .prologue
    .line 164
    invoke-virtual {p0, p1}, Luz/agmk/sttb/pto/MainActivity;->checkSelfPermission(Ljava/lang/String;)I

    move-result v0

    if-nez v0, :cond_0

    const/4 v0, 0x1

    :goto_0
    return v0

    :cond_0
    const/4 v0, 0x0

    goto :goto_0
.end method

.method hasPkg(Ljava/lang/String;)Z
    .locals 3

    .prologue
    const/4 v0, 0x0

    .line 523
    :try_start_0
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v1

    const/4 v2, 0x0

    invoke-virtual {v1, p1, v2}, Landroid/content/pm/PackageManager;->getPackageInfo(Ljava/lang/String;I)Landroid/content/pm/PackageInfo;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    const/4 v0, 0x1

    :goto_0
    return v0

    :catch_0
    move-exception v1

    goto :goto_0
.end method

.method js(Ljava/lang/String;)V
    .locals 2

    .prologue
    .line 154
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$5;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$5;-><init>(Luz/agmk/sttb/pto/MainActivity;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    .line 155
    return-void
.end method

.method kws()Luz/agmk/sttb/pto/Kws;
    .locals 2

    .prologue
    .line 708
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    if-nez v0, :cond_0

    new-instance v0, Luz/agmk/sttb/pto/Kws;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$12;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$12;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-direct {v0, p0, v1}, Luz/agmk/sttb/pto/Kws;-><init>(Landroid/content/Context;Luz/agmk/sttb/pto/Kws$Cb;)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    .line 709
    :cond_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    return-object v0
.end method

.method kwsApply()V
    .locals 4

    .prologue
    const/4 v1, 0x1

    const/4 v2, 0x0

    .line 715
    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsWanted:Z

    if-nez v0, :cond_0

    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsTesting:Z

    if-eqz v0, :cond_2

    :cond_0
    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->resumed:Z

    if-eqz v0, :cond_2

    iget v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsHolds:I

    if-nez v0, :cond_2

    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->srOn:Z

    if-nez v0, :cond_2

    move v0, v1

    .line 716
    :goto_0
    if-eqz v0, :cond_3

    const-string v3, "android.permission.RECORD_AUDIO"

    invoke-virtual {p0, v3}, Luz/agmk/sttb/pto/MainActivity;->has(Ljava/lang/String;)Z

    move-result v3

    if-nez v3, :cond_3

    .line 717
    iput v2, p0, Luz/agmk/sttb/pto/MainActivity;->micDeniedFor:I

    new-instance v0, Luz/agmk/sttb/pto/MainActivity$15;

    invoke-direct {v0, p0}, Luz/agmk/sttb/pto/MainActivity$15;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->afterMicGrant:Ljava/lang/Runnable;

    .line 718
    new-array v0, v1, [Ljava/lang/String;

    const-string v1, "android.permission.RECORD_AUDIO"

    aput-object v1, v0, v2

    const/16 v1, 0x15

    invoke-virtual {p0, v0, v1}, Luz/agmk/sttb/pto/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    .line 722
    :cond_1
    :goto_1
    return-void

    :cond_2
    move v0, v2

    .line 715
    goto :goto_0

    .line 720
    :cond_3
    if-eqz v0, :cond_4

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v1

    invoke-virtual {v1}, Luz/agmk/sttb/pto/Kws;->running()Z

    move-result v1

    if-nez v1, :cond_4

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->start()V

    goto :goto_1

    .line 721
    :cond_4
    if-nez v0, :cond_1

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    if-eqz v0, :cond_1

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->running()Z

    move-result v0

    if-eqz v0, :cond_1

    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->srOn:Z

    if-nez v0, :cond_5

    iget v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsHolds:I

    if-lez v0, :cond_6

    :cond_5
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->stop()V

    goto :goto_1

    :cond_6
    new-instance v0, Ljava/lang/Thread;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$16;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$16;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-direct {v0, v1}, Ljava/lang/Thread;-><init>(Ljava/lang/Runnable;)V

    invoke-virtual {v0}, Ljava/lang/Thread;->start()V

    goto :goto_1
.end method

.method kwsHold(Z)V
    .locals 4

    .prologue
    .line 713
    const/4 v1, 0x0

    iget v2, p0, Luz/agmk/sttb/pto/MainActivity;->kwsHolds:I

    if-eqz p1, :cond_0

    const/4 v0, 0x1

    :goto_0
    add-int/2addr v0, v2

    invoke-static {v1, v0}, Ljava/lang/Math;->max(II)I

    move-result v0

    iput v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsHolds:I

    if-nez p1, :cond_1

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$14;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$14;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    const-wide/16 v2, 0x1c2

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    :goto_1
    return-void

    :cond_0
    const/4 v0, -0x1

    goto :goto_0

    :cond_1
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->kwsApply()V

    goto :goto_1
.end method

.method protected onActivityResult(IILandroid/content/Intent;)V
    .locals 7

    .prologue
    const/4 v5, 0x1

    const/4 v2, -0x1

    const/4 v1, 0x0

    const/4 v3, 0x0

    .line 349
    const/16 v0, 0xb

    if-ne p1, v0, :cond_7

    .line 350
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->fileCb:Landroid/webkit/ValueCallback;

    if-nez v0, :cond_0

    .line 365
    :goto_0
    return-void

    .line 352
    :cond_0
    if-ne p2, v2, :cond_4

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    if-eqz v0, :cond_4

    if-eqz p3, :cond_1

    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v0

    if-nez v0, :cond_4

    invoke-virtual {p3}, Landroid/content/Intent;->getClipData()Landroid/content/ClipData;

    move-result-object v0

    if-nez v0, :cond_4

    .line 353
    :cond_1
    new-array v0, v5, [Landroid/net/Uri;

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    aput-object v2, v0, v1

    .line 359
    :goto_1
    if-nez v0, :cond_2

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    if-eqz v2, :cond_2

    :try_start_0
    const-string v2, "content"

    iget-object v4, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    invoke-virtual {v4}, Landroid/net/Uri;->getScheme()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v2, v4}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_2

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v2

    iget-object v4, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    const/4 v5, 0x0

    const/4 v6, 0x0

    invoke-virtual {v2, v4, v5, v6}, Landroid/content/ContentResolver;->delete(Landroid/net/Uri;Ljava/lang/String;[Ljava/lang/String;)I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    .line 360
    :cond_2
    :goto_2
    if-eqz v0, :cond_3

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    if-eqz v2, :cond_3

    aget-object v1, v0, v1

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    if-eq v1, v2, :cond_3

    :try_start_1
    const-string v1, "content"

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    invoke-virtual {v2}, Landroid/net/Uri;->getScheme()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_3

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    const/4 v4, 0x0

    const/4 v5, 0x0

    invoke-virtual {v1, v2, v4, v5}, Landroid/content/ContentResolver;->delete(Landroid/net/Uri;Ljava/lang/String;[Ljava/lang/String;)I
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    .line 361
    :cond_3
    :goto_3
    iput-object v3, p0, Luz/agmk/sttb/pto/MainActivity;->camUri:Landroid/net/Uri;

    .line 362
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->fileCb:Landroid/webkit/ValueCallback;

    invoke-interface {v1, v0}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V

    iput-object v3, p0, Luz/agmk/sttb/pto/MainActivity;->fileCb:Landroid/webkit/ValueCallback;

    goto :goto_0

    .line 354
    :cond_4
    if-ne p2, v2, :cond_8

    if-eqz p3, :cond_8

    .line 355
    invoke-virtual {p3}, Landroid/content/Intent;->getClipData()Landroid/content/ClipData;

    move-result-object v4

    .line 356
    if-eqz v4, :cond_6

    invoke-virtual {v4}, Landroid/content/ClipData;->getItemCount()I

    move-result v0

    if-lez v0, :cond_6

    invoke-virtual {v4}, Landroid/content/ClipData;->getItemCount()I

    move-result v0

    new-array v2, v0, [Landroid/net/Uri;

    move v0, v1

    :goto_4
    array-length v5, v2

    if-ge v0, v5, :cond_5

    invoke-virtual {v4, v0}, Landroid/content/ClipData;->getItemAt(I)Landroid/content/ClipData$Item;

    move-result-object v5

    invoke-virtual {v5}, Landroid/content/ClipData$Item;->getUri()Landroid/net/Uri;

    move-result-object v5

    aput-object v5, v2, v0

    add-int/lit8 v0, v0, 0x1

    goto :goto_4

    :cond_5
    move-object v0, v2

    goto :goto_1

    .line 357
    :cond_6
    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v0

    if-eqz v0, :cond_8

    new-array v0, v5, [Landroid/net/Uri;

    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v2

    aput-object v2, v0, v1

    goto/16 :goto_1

    .line 364
    :cond_7
    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V

    goto/16 :goto_0

    .line 360
    :catch_0
    move-exception v1

    goto :goto_3

    .line 359
    :catch_1
    move-exception v2

    goto :goto_2

    :cond_8
    move-object v0, v3

    goto/16 :goto_1
.end method

.method public onBackPressed()V
    .locals 0

    .prologue
    .line 388
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->handleBack()V

    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 6

    .prologue
    const/4 v5, -0x1

    const v1, -0xf4f0e7

    const/4 v4, 0x0

    const/4 v3, 0x1

    .line 81
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    :try_start_in0
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getIntent()Landroid/content/Intent;
    move-result-object v0
    invoke-static {p0, v0}, Luz/agmk/sttb/pto/AgmkIn;->grab(Landroid/app/Activity;Landroid/content/Intent;)Ljava/lang/String;
    move-result-object v0
    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->pendingIn:Ljava/lang/String;
    :try_end_in0
    .catch Ljava/lang/Throwable; {:try_start_in0 .. :try_end_in0} :catch_in0
    :catch_in0

    .line 82
    :try_start_0
    new-instance v0, Landroid/os/StrictMode$VmPolicy$Builder;

    invoke-direct {v0}, Landroid/os/StrictMode$VmPolicy$Builder;-><init>()V

    invoke-virtual {v0}, Landroid/os/StrictMode$VmPolicy$Builder;->build()Landroid/os/StrictMode$VmPolicy;

    move-result-object v0

    invoke-static {v0}, Landroid/os/StrictMode;->setVmPolicy(Landroid/os/StrictMode$VmPolicy;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    .line 83
    :goto_0
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v0

    .line 84
    invoke-virtual {v0, v1}, Landroid/view/Window;->setStatusBarColor(I)V

    .line 85
    invoke-virtual {v0, v1}, Landroid/view/Window;->setNavigationBarColor(I)V

    .line 86
    new-instance v0, Landroid/webkit/WebView;

    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    .line 87
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setBackgroundColor(I)V

    .line 88
    new-instance v0, Landroid/widget/FrameLayout;

    invoke-direct {v0, p0}, Landroid/widget/FrameLayout;-><init>(Landroid/content/Context;)V

    .line 89
    invoke-virtual {v0, v1}, Landroid/widget/FrameLayout;->setBackgroundColor(I)V

    .line 90
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v2, Landroid/widget/FrameLayout$LayoutParams;

    invoke-direct {v2, v5, v5}, Landroid/widget/FrameLayout$LayoutParams;-><init>(II)V

    invoke-virtual {v0, v1, v2}, Landroid/widget/FrameLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    .line 91
    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->setContentView(Landroid/view/View;)V

    .line 93
    new-instance v1, Luz/agmk/sttb/pto/MainActivity$1;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$1;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-virtual {v0, v1}, Landroid/widget/FrameLayout;->setOnApplyWindowInsetsListener(Landroid/view/View$OnApplyWindowInsetsListener;)V

    .line 105
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x21

    if-lt v0, v1, :cond_0

    .line 106
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getOnBackInvokedDispatcher()Landroid/window/OnBackInvokedDispatcher;

    move-result-object v0

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$2;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$2;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-interface {v0, v4, v1}, Landroid/window/OnBackInvokedDispatcher;->registerOnBackInvokedCallback(ILandroid/window/OnBackInvokedCallback;)V

    .line 109
    :cond_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object v0

    .line 110
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V

    .line 111
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V

    .line 112
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setDatabaseEnabled(Z)V

    .line 113
    invoke-virtual {v0, v4}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V

    .line 114
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V

    .line 115
    invoke-virtual {v0, v4}, Landroid/webkit/WebSettings;->setMediaPlaybackRequiresUserGesture(Z)V

    .line 116
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setGeolocationEnabled(Z)V

    .line 117
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setLoadWithOverviewMode(Z)V

    .line 118
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setUseWideViewPort(Z)V

    .line 119
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setBuiltInZoomControls(Z)V

    invoke-virtual {v0, v4}, Landroid/webkit/WebSettings;->setDisplayZoomControls(Z)V

    .line 120
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setSupportZoom(Z)V

    .line 121
    const/16 v1, 0x64

    invoke-virtual {v0, v1}, Landroid/webkit/WebSettings;->setTextZoom(I)V

    .line 122
    invoke-virtual {v0, v5}, Landroid/webkit/WebSettings;->setCacheMode(I)V

    .line 123
    invoke-virtual {v0, v3}, Landroid/webkit/WebSettings;->setMixedContentMode(I)V

    .line 124
    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v0}, Landroid/webkit/WebSettings;->getUserAgentString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, " AGMK-STTB-APK/1.0"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/webkit/WebSettings;->setUserAgentString(Ljava/lang/String;)V

    .line 125
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$Bridge;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    const-string v2, "AgmkNative"

    invoke-virtual {v0, v1, v2}, Landroid/webkit/WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    .line 126
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Client;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$Client;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    .line 127
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Chrome;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$Chrome;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V

    .line 128
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$3;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$3;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->setDownloadListener(Landroid/webkit/DownloadListener;)V

    .line 133
    new-instance v0, Landroid/speech/tts/TextToSpeech;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$4;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$4;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    invoke-direct {v0, p0, v1}, Landroid/speech/tts/TextToSpeech;-><init>(Landroid/content/Context;Landroid/speech/tts/TextToSpeech$OnInitListener;)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    .line 148
    goto :goto_2

    .line 149
    :goto_1
    return-void

    .line 148
    :goto_2
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->deepUrl()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    goto :goto_1

    .line 82
    :catch_0
    move-exception v0

    goto/16 :goto_0
.end method

.method protected onDestroy()V
    .locals 1

    .prologue
    .line 725
    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    if-eqz v0, :cond_0

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    invoke-virtual {v0}, Landroid/speech/SpeechRecognizer;->destroy()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_2

    .line 726
    :cond_0
    :goto_0
    :try_start_1
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    if-eqz v0, :cond_1

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->kwsObj:Luz/agmk/sttb/pto/Kws;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->stop()V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_1

    .line 727
    :cond_1
    :goto_1
    :try_start_2
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    if-eqz v0, :cond_2

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v0}, Landroid/speech/tts/TextToSpeech;->shutdown()V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_0

    .line 728
    :cond_2
    :goto_2
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    if-eqz v0, :cond_3

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->destroy()V

    .line 729
    :cond_3
    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V

    .line 730
    return-void

    .line 727
    :catch_0
    move-exception v0

    goto :goto_2

    .line 726
    :catch_1
    move-exception v0

    goto :goto_1

    .line 725
    :catch_2
    move-exception v0

    goto :goto_0
.end method

.method protected onNewIntent(Landroid/content/Intent;)V
    .locals 3

    invoke-super {p0, p1}, Landroid/app/Activity;->onNewIntent(Landroid/content/Intent;)V

    if-eqz p1, :cond_0

    invoke-virtual {p0, p1}, Landroid/app/Activity;->setIntent(Landroid/content/Intent;)V

    const/4 v0, 0x0
    :try_start_in1
    invoke-static {p0, p1}, Luz/agmk/sttb/pto/AgmkIn;->grab(Landroid/app/Activity;Landroid/content/Intent;)Ljava/lang/String;
    move-result-object v0
    :try_end_in1
    .catch Ljava/lang/Throwable; {:try_start_in1 .. :try_end_in1} :catch_in1
    goto :after_in1
    :catch_in1
    move-exception v0
    const/4 v0, 0x0
    :after_in1
    if-eqz v0, :cond_in_none
    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->pendingIn:Ljava/lang/String;
    const-string v0, "try{agmkIncomingPoll()}catch(e){}"
    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V
    return-void
    :cond_in_none

    invoke-virtual {p1}, Landroid/content/Intent;->getDataString()Ljava/lang/String;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-static {v0}, Landroid/net/Uri;->encode(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "try{agmkDeepLink(decodeURIComponent(\'"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v2, "\'))}catch(e){}"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V

    :cond_0
    return-void
.end method

.method protected onPause()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 702
    invoke-super {p0}, Landroid/app/Activity;->onPause()V

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->quiet(Z)V

    iput-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->resumed:Z

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->kwsApply()V

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    if-eqz v0, :cond_0

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->onPause()V

    :cond_0
    return-void
.end method

.method public onRequestPermissionsResult(I[Ljava/lang/String;[I)V
    .locals 7

    .prologue
    const/4 v6, 0x0

    const/4 v1, 0x1

    const/4 v3, 0x0

    .line 369
    array-length v0, p3

    if-lez v0, :cond_1

    aget v0, p3, v3

    if-nez v0, :cond_1

    move v0, v1

    .line 370
    :goto_0
    const/16 v2, 0x17

    if-ne p1, v2, :cond_2

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->pendingWebPerm:Landroid/webkit/PermissionRequest;

    if-eqz v2, :cond_2

    iput-object v6, p0, Luz/agmk/sttb/pto/MainActivity;->pendingWebPerm:Landroid/webkit/PermissionRequest;

    invoke-virtual {p0, v2, v3}, Luz/agmk/sttb/pto/MainActivity;->webPermGo(Landroid/webkit/PermissionRequest;Z)V

    .line 384
    :cond_0
    :goto_1
    return-void

    :cond_1
    move v0, v3

    .line 369
    goto :goto_0

    .line 373
    :cond_2
    const/16 v2, 0x16

    if-ne p1, v2, :cond_5

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->geoCb:Landroid/webkit/GeolocationPermissions$Callback;

    if-eqz v2, :cond_5

    .line 374
    array-length v4, p3

    move v2, v3

    move v0, v3

    :goto_2
    if-ge v2, v4, :cond_4

    aget v5, p3, v2

    if-nez v5, :cond_3

    move v0, v1

    :cond_3
    add-int/lit8 v2, v2, 0x1

    goto :goto_2

    .line 375
    :cond_4
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->geoCb:Landroid/webkit/GeolocationPermissions$Callback;

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->geoOrigin:Ljava/lang/String;

    invoke-interface {v1, v2, v0, v3}, Landroid/webkit/GeolocationPermissions$Callback;->invoke(Ljava/lang/String;ZZ)V

    iput-object v6, p0, Luz/agmk/sttb/pto/MainActivity;->geoCb:Landroid/webkit/GeolocationPermissions$Callback;

    goto :goto_1

    .line 376
    :cond_5
    const/16 v2, 0x15

    if-ne p1, v2, :cond_7

    .line 377
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->afterMicGrant:Ljava/lang/Runnable;

    iput-object v6, p0, Luz/agmk/sttb/pto/MainActivity;->afterMicGrant:Ljava/lang/Runnable;

    .line 378
    if-eqz v0, :cond_6

    if-eqz v1, :cond_6

    invoke-interface {v1}, Ljava/lang/Runnable;->run()V

    goto :goto_1

    .line 379
    :cond_6
    if-nez v0, :cond_0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "window.__agmkSR&&__agmkSR("

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    iget v1, p0, Luz/agmk/sttb/pto/MainActivity;->micDeniedFor:I

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, ",\'error\',\'not-allowed\')"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V

    const-string v0, "Mikrofonga ruxsat berilmadi"

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    goto :goto_1

    .line 380
    :cond_7
    const/16 v2, 0x18

    if-ne p1, v2, :cond_0

    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->pendingSave:[Ljava/lang/String;

    if-eqz v2, :cond_0

    .line 381
    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->pendingSave:[Ljava/lang/String;

    iput-object v6, p0, Luz/agmk/sttb/pto/MainActivity;->pendingSave:[Ljava/lang/String;

    .line 382
    if-eqz v0, :cond_8

    aget-object v0, v2, v3

    aget-object v1, v2, v1

    const/4 v3, 0x2

    aget-object v3, v2, v3

    const-string v4, "1"

    const/4 v5, 0x3

    aget-object v2, v2, v5

    invoke-virtual {v4, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    invoke-virtual {p0, v0, v1, v3, v2}, Luz/agmk/sttb/pto/MainActivity;->doSave(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V

    goto :goto_1

    :cond_8
    const-string v0, "Xotiraga ruxsat berilmadi"

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    goto/16 :goto_1
.end method

.method protected onResume()V
    .locals 1

    .prologue
    .line 703
    invoke-super {p0}, Landroid/app/Activity;->onResume()V

    const/4 v0, 0x1

    iput-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->resumed:Z

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->kwsApply()V

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    if-eqz v0, :cond_0

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->onResume()V

    :cond_0
    return-void
.end method

.method protected onSaveInstanceState(Landroid/os/Bundle;)V
    .locals 1

    .prologue
    .line 151
    invoke-super {p0, p1}, Landroid/app/Activity;->onSaveInstanceState(Landroid/os/Bundle;)V

    return-void
.end method

.method openExternal(Ljava/lang/String;)V
    .locals 3

    .prologue
    .line 160
    :try_start_0
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.VIEW"

    invoke-static {p1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v2

    invoke-direct {v0, v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;Landroid/net/Uri;)V

    const/high16 v1, 0x10000000

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->startActivity(Landroid/content/Intent;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .line 162
    :goto_0
    return-void

    .line 161
    :catch_0
    move-exception v0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "Ochib bo\'lmadi: "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    goto :goto_0
.end method

.method quiet(Z)V
    .locals 4

    .prologue
    .line 497
    :try_start_0
    const-string v0, "audio"

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/media/AudioManager;

    .line 498
    iget-boolean v1, p0, Luz/agmk/sttb/pto/MainActivity;->muted:Z

    if-ne p1, v1, :cond_0

    .line 504
    :goto_0
    return-void

    .line 498
    :cond_0
    iput-boolean p1, p0, Luz/agmk/sttb/pto/MainActivity;->muted:Z

    .line 499
    if-eqz p1, :cond_1

    const/16 v1, -0x64

    .line 500
    :goto_1
    const/4 v2, 0x3

    const/4 v3, 0x0

    invoke-virtual {v0, v2, v1, v3}, Landroid/media/AudioManager;->adjustStreamVolume(III)V

    .line 501
    const/4 v2, 0x1

    const/4 v3, 0x0

    invoke-virtual {v0, v2, v1, v3}, Landroid/media/AudioManager;->adjustStreamVolume(III)V

    .line 502
    const/4 v2, 0x5

    const/4 v3, 0x0

    invoke-virtual {v0, v2, v1, v3}, Landroid/media/AudioManager;->adjustStreamVolume(III)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    .line 503
    :catch_0
    move-exception v0

    goto :goto_0

    .line 499
    :cond_1
    const/16 v1, 0x64

    goto :goto_1
.end method

.method sendVoices()V
    .locals 7

    .prologue
    .line 559
    :try_start_0
    new-instance v2, Lorg/json/JSONArray;

    invoke-direct {v2}, Lorg/json/JSONArray;-><init>()V

    .line 560
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v0}, Landroid/speech/tts/TextToSpeech;->getVoices()Ljava/util/Set;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    move-result-object v3

    .line 561
    const/4 v0, 0x0

    :try_start_1
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v1}, Landroid/speech/tts/TextToSpeech;->getDefaultVoice()Landroid/speech/tts/Voice;
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_1

    move-result-object v0

    move-object v1, v0

    .line 562
    :goto_0
    if-eqz v3, :cond_3

    :try_start_2
    invoke-interface {v3}, Ljava/util/Set;->iterator()Ljava/util/Iterator;

    move-result-object v3

    :cond_0
    :goto_1
    invoke-interface {v3}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_3

    invoke-interface {v3}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/speech/tts/Voice;

    .line 563
    invoke-virtual {v0}, Landroid/speech/tts/Voice;->getFeatures()Ljava/util/Set;

    move-result-object v4

    if-eqz v4, :cond_1

    invoke-virtual {v0}, Landroid/speech/tts/Voice;->getFeatures()Ljava/util/Set;

    move-result-object v4

    const-string v5, "notInstalled"

    invoke-interface {v4, v5}, Ljava/util/Set;->contains(Ljava/lang/Object;)Z

    move-result v4

    if-nez v4, :cond_0

    .line 564
    :cond_1
    new-instance v4, Lorg/json/JSONObject;

    invoke-direct {v4}, Lorg/json/JSONObject;-><init>()V

    .line 565
    const-string v5, "n"

    invoke-virtual {v0}, Landroid/speech/tts/Voice;->getName()Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v5, "l"

    invoke-virtual {v0}, Landroid/speech/tts/Voice;->getLocale()Ljava/util/Locale;

    move-result-object v6

    invoke-virtual {v6}, Ljava/util/Locale;->toLanguageTag()Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v5, "net"

    invoke-virtual {v0}, Landroid/speech/tts/Voice;->isNetworkConnectionRequired()Z

    move-result v6

    invoke-virtual {v4, v5, v6}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    const-string v5, "d"

    if-eqz v1, :cond_2

    invoke-virtual {v1}, Landroid/speech/tts/Voice;->getName()Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v0}, Landroid/speech/tts/Voice;->getName()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v6, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_2

    const/4 v0, 0x1

    :goto_2
    invoke-virtual {v4, v5, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    .line 566
    invoke-virtual {v2, v4}, Lorg/json/JSONArray;->put(Ljava/lang/Object;)Lorg/json/JSONArray;

    goto :goto_1

    .line 569
    :catch_0
    move-exception v0

    .line 570
    :goto_3
    return-void

    .line 561
    :catch_1
    move-exception v1

    move-object v1, v0

    goto :goto_0

    .line 565
    :cond_2
    const/4 v0, 0x0

    goto :goto_2

    .line 568
    :cond_3
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "window.__agmkTTS&&__agmkTTS("

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v2}, Lorg/json/JSONArray;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v1}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, ",\'voices\')"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_0

    goto :goto_3
.end method

.method speakNow([Ljava/lang/String;)V
    .locals 11

    .prologue
    const/4 v2, 0x0

    const/4 v1, 0x1

    .line 573
    aget-object v3, p1, v2

    aget-object v4, p1, v1

    const/4 v0, 0x2

    aget-object v5, p1, v0

    const/4 v0, 0x3

    aget-object v6, p1, v0

    .line 574
    const/4 v0, 0x4

    aget-object v0, p1, v0

    invoke-static {v0}, Ljava/lang/Float;->parseFloat(Ljava/lang/String;)F

    move-result v7

    const/4 v0, 0x5

    aget-object v0, p1, v0

    invoke-static {v0}, Ljava/lang/Float;->parseFloat(Ljava/lang/String;)F

    move-result v8

    .line 576
    if-eqz v6, :cond_1

    invoke-virtual {v6}, Ljava/lang/String;->length()I

    move-result v0

    if-lez v0, :cond_1

    .line 577
    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v0}, Landroid/speech/tts/TextToSpeech;->getVoices()Ljava/util/Set;

    move-result-object v0

    if-eqz v0, :cond_4

    invoke-interface {v0}, Ljava/util/Set;->iterator()Ljava/util/Iterator;

    move-result-object v9

    :cond_0
    invoke-interface {v9}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_4

    invoke-interface {v9}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/speech/tts/Voice;

    invoke-virtual {v0}, Landroid/speech/tts/Voice;->getName()Ljava/lang/String;

    move-result-object v10

    invoke-virtual {v10, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v10

    if-eqz v10, :cond_0

    iget-object v6, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v6, v0}, Landroid/speech/tts/TextToSpeech;->setVoice(Landroid/speech/tts/Voice;)I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    move v0, v1

    :goto_0
    move v2, v0

    .line 579
    :cond_1
    :goto_1
    if-nez v2, :cond_2

    if-eqz v5, :cond_2

    invoke-virtual {v5}, Ljava/lang/String;->length()I

    move-result v0

    if-lez v0, :cond_2

    :try_start_1
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-static {v5}, Ljava/util/Locale;->forLanguageTag(Ljava/lang/String;)Ljava/util/Locale;

    move-result-object v2

    invoke-virtual {v0, v2}, Landroid/speech/tts/TextToSpeech;->setLanguage(Ljava/util/Locale;)I
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    .line 580
    :cond_2
    :goto_2
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v0, v7}, Landroid/speech/tts/TextToSpeech;->setSpeechRate(F)I

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v0, v8}, Landroid/speech/tts/TextToSpeech;->setPitch(F)I

    .line 581
    new-instance v0, Landroid/os/Bundle;

    invoke-direct {v0}, Landroid/os/Bundle;-><init>()V

    .line 582
    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->tts:Landroid/speech/tts/TextToSpeech;

    invoke-virtual {v2, v4, v1, v0, v3}, Landroid/speech/tts/TextToSpeech;->speak(Ljava/lang/CharSequence;ILandroid/os/Bundle;Ljava/lang/String;)I

    move-result v0

    .line 583
    if-eqz v0, :cond_3

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "window.__agmkTTS&&__agmkTTS("

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-static {v3}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, ",\'error\')"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V

    .line 584
    :cond_3
    return-void

    .line 579
    :catch_0
    move-exception v0

    goto :goto_2

    .line 577
    :catch_1
    move-exception v0

    goto :goto_1

    :cond_4
    move v0, v2

    goto :goto_0
.end method

.method srBusy(Z)V
    .locals 4

    .prologue
    .line 712
    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->srOn:Z

    if-ne v0, p1, :cond_0

    :goto_0
    return-void

    :cond_0
    iput-boolean p1, p0, Luz/agmk/sttb/pto/MainActivity;->srOn:Z

    if-eqz p1, :cond_1

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->kwsApply()V

    goto :goto_0

    :cond_1
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$13;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$13;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    const-wide/16 v2, 0x1c2

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    goto :goto_0
.end method

.method srGoogle()Landroid/content/ComponentName;
    .locals 4

    .prologue
    const/4 v3, 0x1

    .line 488
    iget-boolean v0, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleChecked:Z

    if-eqz v0, :cond_0

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleCache:Landroid/content/ComponentName;

    .line 493
    :goto_0
    return-object v0

    .line 489
    :cond_0
    iput-boolean v3, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleChecked:Z

    .line 490
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->srServices()Ljava/util/List;

    move-result-object v0

    invoke-interface {v0}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object v1

    :cond_1
    invoke-interface {v1}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_2

    invoke-interface {v1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Ljava/lang/String;

    .line 491
    const-string v2, "com.google.android.googlequicksearchbox/"

    invoke-virtual {v0, v2}, Ljava/lang/String;->startsWith(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_1

    const-string v1, "/"

    invoke-virtual {v0, v1}, Ljava/lang/String;->split(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v0

    new-instance v1, Landroid/content/ComponentName;

    const/4 v2, 0x0

    aget-object v2, v0, v2

    aget-object v0, v0, v3

    invoke-direct {v1, v2, v0}, Landroid/content/ComponentName;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    iput-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleCache:Landroid/content/ComponentName;

    .line 493
    :cond_2
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->srGoogleCache:Landroid/content/ComponentName;

    goto :goto_0
.end method

.method srServices()Ljava/util/List;
    .locals 5
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List",
            "<",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation

    .prologue
    .line 480
    new-instance v1, Ljava/util/ArrayList;

    invoke-direct {v1}, Ljava/util/ArrayList;-><init>()V

    .line 482
    :try_start_0
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v0

    new-instance v2, Landroid/content/Intent;

    const-string v3, "android.speech.RecognitionService"

    invoke-direct {v2, v3}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    const/4 v3, 0x0

    invoke-virtual {v0, v2, v3}, Landroid/content/pm/PackageManager;->queryIntentServices(Landroid/content/Intent;I)Ljava/util/List;

    move-result-object v0

    .line 483
    invoke-interface {v0}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object v2

    :cond_0
    :goto_0
    invoke-interface {v2}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_1

    invoke-interface {v2}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/content/pm/ResolveInfo;

    iget-object v3, v0, Landroid/content/pm/ResolveInfo;->serviceInfo:Landroid/content/pm/ServiceInfo;

    if-eqz v3, :cond_0

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    iget-object v4, v0, Landroid/content/pm/ResolveInfo;->serviceInfo:Landroid/content/pm/ServiceInfo;

    iget-object v4, v4, Landroid/content/pm/ServiceInfo;->packageName:Ljava/lang/String;

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    const-string v4, "/"

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    iget-object v0, v0, Landroid/content/pm/ResolveInfo;->serviceInfo:Landroid/content/pm/ServiceInfo;

    iget-object v0, v0, Landroid/content/pm/ServiceInfo;->name:Ljava/lang/String;

    invoke-virtual {v3, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-interface {v1, v0}, Ljava/util/List;->add(Ljava/lang/Object;)Z
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    .line 484
    :catch_0
    move-exception v0

    .line 485
    :cond_1
    return-object v1
.end method

.method srStartMain(ILjava/lang/String;ZZ)V
    .locals 8

    .prologue
    const/4 v7, 0x0

    const/4 v6, 0x1

    .line 403
    invoke-static {p0}, Landroid/speech/SpeechRecognizer;->isRecognitionAvailable(Landroid/content/Context;)Z

    move-result v0

    if-nez v0, :cond_1

    .line 404
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "window.__agmkSR&&__agmkSR("

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, ",\'error\',\'service-not-allowed\')"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V

    .line 405
    const-string v0, "Telefonda ovozni tanish xizmati yo\'q (Google ilovasini o\'rnating)"

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    .line 474
    :cond_0
    :goto_0
    return-void

    .line 408
    :cond_1
    const-string v0, "android.permission.RECORD_AUDIO"

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->has(Ljava/lang/String;)Z

    move-result v0

    if-nez v0, :cond_2

    .line 409
    iput p1, p0, Luz/agmk/sttb/pto/MainActivity;->micDeniedFor:I

    .line 410
    new-instance v0, Luz/agmk/sttb/pto/MainActivity$8;

    move-object v1, p0

    move v2, p1

    move-object v3, p2

    move v4, p3

    move v5, p4

    invoke-direct/range {v0 .. v5}, Luz/agmk/sttb/pto/MainActivity$8;-><init>(Luz/agmk/sttb/pto/MainActivity;ILjava/lang/String;ZZ)V

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->afterMicGrant:Ljava/lang/Runnable;

    .line 411
    new-array v0, v6, [Ljava/lang/String;

    const-string v1, "android.permission.RECORD_AUDIO"

    aput-object v1, v0, v7

    const/16 v1, 0x15

    invoke-virtual {p0, v0, v1}, Luz/agmk/sttb/pto/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    goto :goto_0

    .line 414
    :cond_2
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    if-eqz v0, :cond_3

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    invoke-virtual {v0}, Landroid/speech/SpeechRecognizer;->cancel()V

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    invoke-virtual {v0}, Landroid/speech/SpeechRecognizer;->destroy()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    :goto_1
    const/4 v0, 0x0

    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    .line 415
    :cond_3
    iput p1, p0, Luz/agmk/sttb/pto/MainActivity;->srId:I

    iput-boolean p4, p0, Luz/agmk/sttb/pto/MainActivity;->srContinuous:Z

    invoke-virtual {p0, v6}, Luz/agmk/sttb/pto/MainActivity;->srBusy(Z)V

    .line 416
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->srGoogle()Landroid/content/ComponentName;

    move-result-object v0

    .line 417
    if-eqz v0, :cond_6

    invoke-static {p0, v0}, Landroid/speech/SpeechRecognizer;->createSpeechRecognizer(Landroid/content/Context;Landroid/content/ComponentName;)Landroid/speech/SpeechRecognizer;

    move-result-object v0

    :goto_2
    iput-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    .line 418
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    .line 419
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    new-instance v2, Luz/agmk/sttb/pto/MainActivity$9;

    invoke-direct {v2, p0, p1, v0, p3}, Luz/agmk/sttb/pto/MainActivity$9;-><init>(Luz/agmk/sttb/pto/MainActivity;ILandroid/speech/SpeechRecognizer;Z)V

    invoke-virtual {v1, v2}, Landroid/speech/SpeechRecognizer;->setRecognitionListener(Landroid/speech/RecognitionListener;)V

    .line 456
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.speech.action.RECOGNIZE_SPEECH"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .line 457
    const-string v1, "android.speech.extra.LANGUAGE_MODEL"

    const-string v2, "free_form"

    invoke-virtual {v0, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    .line 458
    const-string v1, "android.speech.extra.LANGUAGE"

    invoke-virtual {v0, v1, p2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    .line 459
    const-string v1, "android.speech.extra.LANGUAGE_PREFERENCE"

    invoke-virtual {v0, v1, p2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    .line 460
    const-string v1, "android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES"

    new-array v2, v6, [Ljava/lang/String;

    aput-object p2, v2, v7

    invoke-virtual {v0, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;[Ljava/lang/String;)Landroid/content/Intent;

    .line 461
    const-string v1, "android.speech.extra.PARTIAL_RESULTS"

    invoke-virtual {v0, v1, p3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Z)Landroid/content/Intent;

    .line 462
    const-string v1, "android.speech.extra.MAX_RESULTS"

    invoke-virtual {v0, v1, v6}, Landroid/content/Intent;->putExtra(Ljava/lang/String;I)Landroid/content/Intent;

    .line 463
    const-string v1, "calling_package"

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getPackageName()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Ljava/lang/String;)Landroid/content/Intent;

    .line 464
    if-eqz p4, :cond_7

    const-string v1, "android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS"

    const-wide/16 v2, 0x9c4

    invoke-virtual {v0, v1, v2, v3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;J)Landroid/content/Intent;

    .line 470
    :cond_4
    :goto_3
    iget-boolean v1, p0, Luz/agmk/sttb/pto/MainActivity;->srQuiet:Z

    iput-boolean v7, p0, Luz/agmk/sttb/pto/MainActivity;->srQuiet:Z

    .line 471
    if-eqz v1, :cond_5

    invoke-virtual {p0, v6}, Luz/agmk/sttb/pto/MainActivity;->quiet(Z)V

    .line 472
    :cond_5
    :try_start_1
    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity;->sr:Landroid/speech/SpeechRecognizer;

    invoke-virtual {v2, v0}, Landroid/speech/SpeechRecognizer;->startListening(Landroid/content/Intent;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    .line 473
    :goto_4
    if-eqz v1, :cond_0

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$10;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$10;-><init>(Luz/agmk/sttb/pto/MainActivity;)V

    const-wide/16 v2, 0x384

    invoke-virtual {v0, v1, v2, v3}, Landroid/os/Handler;->postDelayed(Ljava/lang/Runnable;J)Z

    goto/16 :goto_0

    .line 417
    :cond_6
    invoke-static {p0}, Landroid/speech/SpeechRecognizer;->createSpeechRecognizer(Landroid/content/Context;)Landroid/speech/SpeechRecognizer;

    move-result-object v0

    goto :goto_2

    .line 465
    :cond_7
    iget v1, p0, Luz/agmk/sttb/pto/MainActivity;->srSilenceMs:I

    if-lez v1, :cond_4

    .line 467
    const-string v1, "android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS"

    iget v2, p0, Luz/agmk/sttb/pto/MainActivity;->srSilenceMs:I

    int-to-long v2, v2

    invoke-virtual {v0, v1, v2, v3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;J)Landroid/content/Intent;

    .line 468
    const-string v1, "android.speech.extras.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS"

    iget v2, p0, Luz/agmk/sttb/pto/MainActivity;->srSilenceMs:I

    int-to-long v2, v2

    invoke-virtual {v0, v1, v2, v3}, Landroid/content/Intent;->putExtra(Ljava/lang/String;J)Landroid/content/Intent;

    goto :goto_3

    .line 472
    :catch_0
    move-exception v0

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "window.__agmkSR&&__agmkSR("

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v2, ",\'error\',\'aborted\')"

    invoke-virtual {v0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Luz/agmk/sttb/pto/MainActivity;->js(Ljava/lang/String;)V

    goto :goto_4

    .line 414
    :catch_1
    move-exception v0

    goto/16 :goto_1
.end method

.method toast(Ljava/lang/String;)V
    .locals 2

    .prologue
    .line 157
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$6;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$6;-><init>(Luz/agmk/sttb/pto/MainActivity;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method webPermGo(Landroid/webkit/PermissionRequest;Z)V
    .locals 9

    .prologue
    invoke-virtual {p1}, Landroid/webkit/PermissionRequest;->getResources()[Ljava/lang/String;

    move-result-object v0

    new-instance v1, Ljava/util/ArrayList;

    invoke-direct {v1}, Ljava/util/ArrayList;-><init>()V

    new-instance v2, Ljava/util/ArrayList;

    invoke-direct {v2}, Ljava/util/ArrayList;-><init>()V

    array-length v3, v0

    const/4 v4, 0x0

    :goto_0
    if-ge v4, v3, :cond_4

    aget-object v5, v0, v4

    const/4 v6, 0x0

    const-string v7, "android.webkit.resource.AUDIO_CAPTURE"

    invoke-virtual {v7, v5}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-eqz v8, :cond_0

    const-string v6, "android.permission.RECORD_AUDIO"

    :cond_0
    const-string v7, "android.webkit.resource.VIDEO_CAPTURE"

    invoke-virtual {v7, v5}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-eqz v8, :cond_1

    const-string v6, "android.permission.CAMERA"

    :cond_1
    if-eqz v6, :cond_3

    invoke-virtual {p0, v6}, Luz/agmk/sttb/pto/MainActivity;->has(Ljava/lang/String;)Z

    move-result v8

    if-eqz v8, :cond_2

    invoke-virtual {v1, v5}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    goto :goto_1

    :cond_2
    invoke-virtual {v2, v6}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    :cond_3
    :goto_1
    add-int/lit8 v4, v4, 0x1

    goto :goto_0

    :cond_4
    if-eqz p2, :cond_5

    invoke-virtual {v2}, Ljava/util/ArrayList;->isEmpty()Z

    move-result v8

    if-nez v8, :cond_5

    iput-object p1, p0, Luz/agmk/sttb/pto/MainActivity;->pendingWebPerm:Landroid/webkit/PermissionRequest;

    const/4 v3, 0x0

    new-array v3, v3, [Ljava/lang/String;

    invoke-virtual {v2, v3}, Ljava/util/ArrayList;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

    move-result-object v3

    check-cast v3, [Ljava/lang/String;

    const/16 v4, 0x17

    invoke-virtual {p0, v3, v4}, Luz/agmk/sttb/pto/MainActivity;->requestPermissions([Ljava/lang/String;I)V

    return-void

    :cond_5
    invoke-virtual {v1}, Ljava/util/ArrayList;->isEmpty()Z

    move-result v8

    if-eqz v8, :cond_6

    invoke-virtual {p1}, Landroid/webkit/PermissionRequest;->deny()V

    return-void

    :cond_6
    const/4 v3, 0x0

    new-array v3, v3, [Ljava/lang/String;

    invoke-virtual {v1, v3}, Ljava/util/ArrayList;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

    move-result-object v3

    check-cast v3, [Ljava/lang/String;

    invoke-virtual {p1, v3}, Landroid/webkit/PermissionRequest;->grant([Ljava/lang/String;)V

    return-void
.end method

.method writeShare(Ljava/lang/String;Ljava/lang/String;[B)Landroid/net/Uri;
    .locals 4
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    .prologue
    .line 508
    const-string v0, "[\\\\/:*?\"<>|]"

    const-string v1, "_"

    invoke-virtual {p1, v0, v1}, Ljava/lang/String;->replaceAll(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    .line 509
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x1d

    if-lt v0, v2, :cond_1

    .line 510
    new-instance v0, Landroid/content/ContentValues;

    invoke-direct {v0}, Landroid/content/ContentValues;-><init>()V

    .line 511
    const-string v2, "_display_name"

    invoke-virtual {v0, v2, v1}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 512
    const-string v1, "mime_type"

    invoke-virtual {v0, v1, p2}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 513
    const-string v1, "relative_path"

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    sget-object v3, Landroid/os/Environment;->DIRECTORY_DOWNLOADS:Ljava/lang/String;

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    const-string v3, "/AGMK-STTB/Yuborilgan"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Landroid/content/ContentValues;->put(Ljava/lang/String;Ljava/lang/String;)V

    .line 514
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    sget-object v2, Landroid/provider/MediaStore$Downloads;->EXTERNAL_CONTENT_URI:Landroid/net/Uri;

    invoke-virtual {v1, v2, v0}, Landroid/content/ContentResolver;->insert(Landroid/net/Uri;Landroid/content/ContentValues;)Landroid/net/Uri;

    move-result-object v0

    .line 515
    if-nez v0, :cond_0

    new-instance v0, Ljava/lang/Exception;

    const-string v1, "insert"

    invoke-direct {v0, v1}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    throw v0

    .line 516
    :cond_0
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    invoke-virtual {v1, v0}, Landroid/content/ContentResolver;->openOutputStream(Landroid/net/Uri;)Ljava/io/OutputStream;

    move-result-object v1

    invoke-virtual {v1, p3}, Ljava/io/OutputStream;->write([B)V

    invoke-virtual {v1}, Ljava/io/OutputStream;->close()V

    .line 521
    :goto_0
    return-object v0

    .line 519
    :cond_1
    new-instance v2, Ljava/io/File;

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getExternalCacheDir()Ljava/io/File;

    move-result-object v0

    if-eqz v0, :cond_2

    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getExternalCacheDir()Ljava/io/File;

    move-result-object v0

    :goto_1
    const-string v3, "share"

    invoke-direct {v2, v0, v3}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {v2}, Ljava/io/File;->mkdirs()Z

    .line 520
    new-instance v0, Ljava/io/File;

    invoke-direct {v0, v2, v1}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    new-instance v1, Ljava/io/FileOutputStream;

    invoke-direct {v1, v0}, Ljava/io/FileOutputStream;-><init>(Ljava/io/File;)V

    invoke-virtual {v1, p3}, Ljava/io/FileOutputStream;->write([B)V

    invoke-virtual {v1}, Ljava/io/FileOutputStream;->close()V

    .line 521
    invoke-static {v0}, Landroid/net/Uri;->fromFile(Ljava/io/File;)Landroid/net/Uri;

    move-result-object v0

    goto :goto_0

    .line 519
    :cond_2
    invoke-virtual {p0}, Luz/agmk/sttb/pto/MainActivity;->getCacheDir()Ljava/io/File;

    move-result-object v0

    goto :goto_1
.end method
