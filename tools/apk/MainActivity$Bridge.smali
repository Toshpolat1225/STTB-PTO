.class Luz/agmk/sttb/pto/MainActivity$Bridge;
.super Ljava/lang/Object;
.source "MainActivity.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Luz/agmk/sttb/pto/MainActivity;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = "Bridge"
.end annotation


# instance fields
.field final synthetic this$0:Luz/agmk/sttb/pto/MainActivity;


# direct methods
.method constructor <init>(Luz/agmk/sttb/pto/MainActivity;)V
    .locals 0

    .prologue
    .line 645
    iput-object p1, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public getPins()Ljava/lang/String;
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 699
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    const-string v1, "agmk"

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Luz/agmk/sttb/pto/MainActivity;->getSharedPreferences(Ljava/lang/String;I)Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v1, "pins"

    const-string v2, ""

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public gpsPerm()V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-static {v0}, Luz/agmk/sttb/pto/GpsSvc;->perm(Landroid/app/Activity;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public gpsSettings()V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-static {v0}, Luz/agmk/sttb/pto/GpsSvc;->settings(Landroid/app/Activity;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public gpsStart(Ljava/lang/String;)V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-static {v0, p1}, Luz/agmk/sttb/pto/GpsSvc;->start(Landroid/app/Activity;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public gpsState()Ljava/lang/String;
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-static {v0}, Luz/agmk/sttb/pto/GpsSvc;->state(Landroid/app/Activity;)Ljava/lang/String;

    move-result-object v0
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-object v0

    :catch_0
    move-exception v0

    const-string v0, "{}"

    return-object v0
.end method

.method public gpsStop()V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-static {v0}, Luz/agmk/sttb/pto/GpsSvc;->stop(Landroid/app/Activity;)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public gpsTake()Ljava/lang/String;
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    invoke-static {}, Luz/agmk/sttb/pto/GpsSvc;->take()Ljava/lang/String;

    move-result-object v0
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-object v0

    :catch_0
    move-exception v0

    const-string v0, "[]"

    return-object v0
.end method

.method public kwsClear()V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 663
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->clearModel()V

    return-void
.end method

.method public kwsEnroll(Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 657
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$8;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$8;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    .line 662
    return-void
.end method

.method public kwsFalse()V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 665
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->reportFalse()V

    return-void
.end method

.method public kwsGetSens()I
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 655
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->getSens()I

    move-result v0

    return v0
.end method

.method public kwsHas()Z
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 653
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->hasModel()Z

    move-result v0

    return v0
.end method

.method public kwsMute(I)V
    .locals 4
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 668
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    int-to-long v2, p1

    invoke-virtual {v0, v2, v3}, Luz/agmk/sttb/pto/Kws;->mute(J)V

    return-void
.end method

.method public kwsNeg()Z
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 666
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->addNeg()Z

    move-result v0

    return v0
.end method

.method public kwsNegCount()I
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 667
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->negCount()I

    move-result v0

    return v0
.end method

.method public kwsPause(Z)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 679
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$9;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$9;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Z)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public kwsSens(I)V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 654
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0, p1}, Luz/agmk/sttb/pto/Kws;->setSens(I)V

    return-void
.end method

.method public kwsSet(Z)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 652
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$6;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$6;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Z)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public kwsStats()Ljava/lang/String;
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 664
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->kws()Luz/agmk/sttb/pto/Kws;

    move-result-object v0

    invoke-virtual {v0}, Luz/agmk/sttb/pto/Kws;->stats()Lorg/json/JSONObject;

    move-result-object v0

    invoke-virtual {v0}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method public kwsTest(Z)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 656
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$7;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$7;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Z)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public openExternal(Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 687
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$14;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$14;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public print(Ljava/lang/String;Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 688
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$15;

    invoke-direct {v1, p0, p1, p2}, Luz/agmk/sttb/pto/MainActivity$Bridge$15;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public saveFile(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V
    .locals 7
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 686
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v6, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v0, Luz/agmk/sttb/pto/MainActivity$Bridge$13;

    move-object v1, p0

    move-object v2, p1

    move-object v3, p2

    move-object v4, p3

    move v5, p4

    invoke-direct/range {v0 .. v5}, Luz/agmk/sttb/pto/MainActivity$Bridge$13;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V

    invoke-virtual {v6, v0}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public setPin(Ljava/lang/String;)Z
    .locals 9
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    const/4 v0, 0x0

    .line 692
    if-nez p1, :cond_1

    .line 697
    :cond_0
    :goto_0
    return v0

    .line 692
    :cond_1
    invoke-virtual {p1}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v1

    sget-object v2, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {v1, v2}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v1

    const-string v2, ":"

    const-string v3, ""

    invoke-virtual {v1, v2, v3}, Ljava/lang/String;->replace(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Ljava/lang/String;

    move-result-object v1

    .line 693
    const-string v2, "[0-9a-f]{64}"

    invoke-virtual {v1, v2}, Ljava/lang/String;->matches(Ljava/lang/String;)Z

    move-result v2

    if-eqz v2, :cond_0

    .line 694
    iget-object v2, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    const-string v3, "agmk"

    invoke-virtual {v2, v3, v0}, Luz/agmk/sttb/pto/MainActivity;->getSharedPreferences(Ljava/lang/String;I)Landroid/content/SharedPreferences;

    move-result-object v2

    const-string v3, "pins"

    const-string v4, ""

    invoke-interface {v2, v3, v4}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    .line 695
    new-instance v4, Ljava/util/ArrayList;

    invoke-direct {v4}, Ljava/util/ArrayList;-><init>()V

    invoke-virtual {v4, v1}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    const-string v5, ","

    invoke-virtual {v3, v5}, Ljava/lang/String;->split(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v3

    array-length v5, v3

    :goto_1
    if-ge v0, v5, :cond_3

    aget-object v6, v3, v0

    invoke-virtual {v6}, Ljava/lang/String;->length()I

    move-result v7

    const/16 v8, 0x40

    if-ne v7, v8, :cond_2

    invoke-virtual {v6, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v7

    if-nez v7, :cond_2

    invoke-virtual {v4}, Ljava/util/ArrayList;->size()I

    move-result v7

    const/4 v8, 0x3

    if-ge v7, v8, :cond_2

    invoke-virtual {v4, v6}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    :cond_2
    add-int/lit8 v0, v0, 0x1

    goto :goto_1

    .line 696
    :cond_3
    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v4}, Ljava/util/ArrayList;->iterator()Ljava/util/Iterator;

    move-result-object v3

    :goto_2
    invoke-interface {v3}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_5

    invoke-interface {v3}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Ljava/lang/String;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->length()I

    move-result v4

    if-lez v4, :cond_4

    const-string v4, ","

    invoke-virtual {v1, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    :cond_4
    invoke-virtual {v1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    goto :goto_2

    .line 697
    :cond_5
    invoke-interface {v2}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v2, "pins"

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-interface {v0, v2, v1}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    const/4 v0, 0x1

    goto/16 :goto_0
.end method

.method public setSecure(Z)V
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v1, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v2, Luz/agmk/sttb/pto/AgmkX;

    invoke-direct {v2, v0, p1}, Luz/agmk/sttb/pto/AgmkX;-><init>(Landroid/app/Activity;Z)V

    invoke-virtual {v1, v2}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public setTextZoom(I)V
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v1, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v2, Luz/agmk/sttb/pto/AgmkZ;

    invoke-direct {v2, v0, p1}, Luz/agmk/sttb/pto/AgmkZ;-><init>(Luz/agmk/sttb/pto/MainActivity;I)V

    invoke-virtual {v1, v2}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public shareFiles(Ljava/lang/String;)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 648
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$3;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$3;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;Ljava/lang/String;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public srAbort(I)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 650
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$5;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$5;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;I)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public srInfo()Ljava/lang/String;
    .locals 4
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 672
    :try_start_0
    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    new-instance v2, Lorg/json/JSONArray;

    invoke-direct {v2}, Lorg/json/JSONArray;-><init>()V

    .line 673
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->srServices()Ljava/util/List;

    move-result-object v0

    invoke-interface {v0}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object v3

    :goto_0
    invoke-interface {v3}, Ljava/util/Iterator;->hasNext()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-interface {v3}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Ljava/lang/String;

    invoke-virtual {v2, v0}, Lorg/json/JSONArray;->put(Ljava/lang/Object;)Lorg/json/JSONArray;
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    .line 677
    :catch_0
    move-exception v0

    const-string v0, "{}"

    :goto_1
    return-object v0

    .line 674
    :cond_0
    :try_start_1
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0}, Luz/agmk/sttb/pto/MainActivity;->srGoogle()Landroid/content/ComponentName;

    move-result-object v3

    .line 675
    const-string v0, "services"

    invoke-virtual {v1, v0, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v2, "google"

    if-eqz v3, :cond_1

    const/4 v0, 0x1

    :goto_2
    invoke-virtual {v1, v2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Z)Lorg/json/JSONObject;

    const-string v2, "using"

    if-eqz v3, :cond_2

    invoke-virtual {v3}, Landroid/content/ComponentName;->flattenToShortString()Ljava/lang/String;

    move-result-object v0

    :goto_3
    invoke-virtual {v1, v2, v0}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    .line 676
    invoke-virtual {v1}, Lorg/json/JSONObject;->toString()Ljava/lang/String;

    move-result-object v0

    goto :goto_1

    .line 675
    :cond_1
    const/4 v0, 0x0

    goto :goto_2

    :cond_2
    const-string v0, "standart (telefon tanlagan)"
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    goto :goto_3
.end method

.method public srSilence(I)V
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 669
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    const/4 v1, 0x0

    const/16 v2, 0x1770

    invoke-static {v2, p1}, Ljava/lang/Math;->min(II)I

    move-result v2

    invoke-static {v1, v2}, Ljava/lang/Math;->max(II)I

    move-result v1

    iput v1, v0, Luz/agmk/sttb/pto/MainActivity;->srSilenceMs:I

    return-void
.end method

.method public srStart(ILjava/lang/String;ZZ)V
    .locals 7
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 646
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v6, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v0, Luz/agmk/sttb/pto/MainActivity$Bridge$1;

    move-object v1, p0

    move v2, p1

    move-object v3, p2

    move v4, p3

    move v5, p4

    invoke-direct/range {v0 .. v5}, Luz/agmk/sttb/pto/MainActivity$Bridge$1;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;ILjava/lang/String;ZZ)V

    invoke-virtual {v6, v0}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public srStartQ(ILjava/lang/String;ZZZ)V
    .locals 8
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 647
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v7, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v0, Luz/agmk/sttb/pto/MainActivity$Bridge$2;

    move-object v1, p0

    move v2, p5

    move v3, p1

    move-object v4, p2

    move v5, p3

    move v6, p4

    invoke-direct/range {v0 .. v6}, Luz/agmk/sttb/pto/MainActivity$Bridge$2;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;ZILjava/lang/String;ZZ)V

    invoke-virtual {v7, v0}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public srStop(I)V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 649
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$4;

    invoke-direct {v1, p0, p1}, Luz/agmk/sttb/pto/MainActivity$Bridge$4;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;I)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public toast(Ljava/lang/String;)V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 689
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-virtual {v0, p1}, Luz/agmk/sttb/pto/MainActivity;->toast(Ljava/lang/String;)V

    return-void
.end method

.method public ttsSpeak(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;DD)V
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 682
    const/4 v0, 0x6

    new-array v0, v0, [Ljava/lang/String;

    const/4 v1, 0x0

    aput-object p1, v0, v1

    const/4 v1, 0x1

    aput-object p2, v0, v1

    const/4 v1, 0x2

    aput-object p3, v0, v1

    const/4 v1, 0x3

    aput-object p4, v0, v1

    const/4 v1, 0x4

    double-to-float v2, p5

    invoke-static {v2}, Ljava/lang/String;->valueOf(F)Ljava/lang/String;

    move-result-object v2

    aput-object v2, v0, v1

    const/4 v1, 0x5

    double-to-float v2, p7

    invoke-static {v2}, Ljava/lang/String;->valueOf(F)Ljava/lang/String;

    move-result-object v2

    aput-object v2, v0, v1

    .line 683
    iget-object v1, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v1, v1, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v2, Luz/agmk/sttb/pto/MainActivity$Bridge$11;

    invoke-direct {v2, p0, v0}, Luz/agmk/sttb/pto/MainActivity$Bridge$11;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;[Ljava/lang/String;)V

    invoke-virtual {v1, v2}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    .line 684
    return-void
.end method

.method public ttsStop()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 685
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$12;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$Bridge$12;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public ttsVoices()V
    .locals 2
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 680
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    iget-object v0, v0, Luz/agmk/sttb/pto/MainActivity;->ui:Landroid/os/Handler;

    new-instance v1, Luz/agmk/sttb/pto/MainActivity$Bridge$10;

    invoke-direct {v1, p0}, Luz/agmk/sttb/pto/MainActivity$Bridge$10;-><init>(Luz/agmk/sttb/pto/MainActivity$Bridge;)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public version()Ljava/lang/String;
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    .prologue
    .line 690
    const-string v0, "3.16.5"

    return-object v0
.end method

.method public vibrate(I)V
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;

    invoke-static {v0, p1}, Luz/agmk/sttb/pto/AgmkX;->vibrate(Landroid/app/Activity;I)V
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    return-void

    :catch_0
    move-exception v0

    return-void
.end method

.method public takeIncoming()Ljava/lang/String;
    .locals 3
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;
    iget-object v1, v0, Luz/agmk/sttb/pto/MainActivity;->pendingIn:Ljava/lang/String;
    const/4 v2, 0x0
    iput-object v2, v0, Luz/agmk/sttb/pto/MainActivity;->pendingIn:Ljava/lang/String;
    if-nez v1, :cond_0
    const-string v1, ""
    :cond_0
    return-object v1
.end method

.method public openUri(Ljava/lang/String;Ljava/lang/String;)Z
    .locals 1
    .annotation runtime Landroid/webkit/JavascriptInterface;
    .end annotation

    :try_start_0
    iget-object v0, p0, Luz/agmk/sttb/pto/MainActivity$Bridge;->this$0:Luz/agmk/sttb/pto/MainActivity;
    invoke-static {v0, p1, p2}, Luz/agmk/sttb/pto/AgmkIn;->openUri(Landroid/app/Activity;Ljava/lang/String;Ljava/lang/String;)Z
    move-result v0
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0
    return v0
    :catch_0
    move-exception v0
    const/4 v0, 0x0
    return v0
.end method
