// index.js
// const app = getApp()
Page({
  data: {
    category: ['red', 'yellow', 'blue', 'green', 'purple'],
    column: 10,
    row: 10,
    list: [],
    loading: false,
    pass: 1,
    goal: 1000,
    score: 0,
    animationData: {},
    transting: false
  },
  onShow() {
    setTimeout(() => {
      this.animateStart();
    }, 500);
  },
  //开始动画
  animateStart() {
    this.setData({
      transting: true
    })
  },
  //动画结束
  animateEnd() {
    this.setData({
      transting: false
    })
    this.init();
  },
  //点击元素响应事件
  clickPoint(event) {
    if (this.data.loading) return;
    this.setData({
      loading: true
    })
    let clickX = event.currentTarget.dataset.x;
    let clickY = event.currentTarget.dataset.y;

    //寻找相邻的相同图案
    let eliminations = [{ x: clickX, y: clickY }];
    this.findSame({ x: clickX, y: clickY }, eliminations);
    if (eliminations.length < 2) {
      this.setData({
        loading: false
      })
      return;
    }
    //给需要删除的元素增加摇动效果
    for (let x = this.data.list.length - 1; x >= 0; x--) {
      const column = this.data.list[x];
      for (let y = column.length - 1; y >= 0; y--) {
        if (eliminations.find(f => f.x == x && f.y == y)) {
          this.data.list[x][y].shake = true;
        }
      }
    }
    this.setData({
      list: this.data.list
    })
    //删除需要删除的元素
    for (let x = this.data.list.length - 1; x >= 0; x--) {
      const column = this.data.list[x];
      for (let y = column.length - 1; y >= 0; y--) {
        if (eliminations.find(f => f.x == x && f.y == y)) {
          this.data.list[x].splice(y, 1);
        }
      }
    }

    //计算得分
    this.sumScore(eliminations);

    //留出200ms抖动时间
    setTimeout(() => {
      this.setData({
        list: this.data.list
      })
      this.moveLeft();
      this.setData({
        loading: false
      })
      this.isEnd();
    }, 200);

  },
  //计算得分
  sumScore(eliminations) {
    let num = eliminations.length;
    let one = 10 + 5 * (num - 2);
    wx.showToast({
      title: `消灭${num}个，获得${num * one}分`,
      icon: 'none',
      duration: 1000
    })
    for (let index = 0; index < num; index++) {
      setTimeout(() => {
        this.setData({
          score: this.data.score + one
        })
      }, 100 * index);
    }

  },
  //寻找相邻的相同图案
  findSame({ x, y }, finds = []) {
    let point = this.data.list[x][y];
    //寻找左边
    let leftX = x - 1;
    let leftY = y;
    let findLeftPoint = finds.find(f => f.x == leftX && f.y == leftY);
    let leftPoint = this.data.list[leftX] && this.data.list[leftX][leftY];
    if (!findLeftPoint && leftPoint && leftPoint.type == point.type) {
      finds.push({ x: leftX, y: leftY });
      this.findSame({ x: leftX, y: leftY }, finds);
    }
    //寻找右边
    let rightX = x + 1;
    let rightY = y;
    let findRightPoint = finds.find(f => f.x == rightX && f.y == rightY);
    let rightPoint = this.data.list[rightX] && this.data.list[rightX][rightY];
    if (!findRightPoint && rightPoint && rightPoint.type == point.type) {
      finds.push({ x: rightX, y: rightY });
      this.findSame({ x: rightX, y: rightY }, finds);
    }
    //寻找上边
    let topX = x;
    let topY = y + 1;
    let findTopPoint = finds.find(f => f.x == topX && f.y == topY);
    let topPoint = this.data.list[topX] && this.data.list[topX][topY];
    if (!findTopPoint && topPoint && topPoint.type == point.type) {
      finds.push({ x: topX, y: topY });
      this.findSame({ x: topX, y: topY }, finds);
    }
    //寻找下边
    let bottomX = x;
    let bottomY = y - 1;
    let findBottomPoint = finds.find(f => f.x == bottomX && f.y == bottomY);
    let bottomPoint = this.data.list[bottomX] && this.data.list[bottomX][bottomY];
    if (!findBottomPoint && bottomPoint && bottomPoint.type == point.type) {
      finds.push({ x: bottomX, y: bottomY });
      this.findSame({ x: bottomX, y: bottomY }, finds);
    }
  },
  //判断剩余元素是否可消除
  isEnd() {
    let isEnd = true;
    this.data.list.forEach((column, x) => {
      column.forEach((point, y) => {
        let finds = [];
        this.findSame({ x, y }, finds);
        if (finds.length) {
          isEnd = false;
        }
      })
    })
    if (isEnd) {
      if (this.data.score < this.data.goal) {
        wx.showModal({
          title: '通关失败',
          content: '想要再玩一次吗',
          cancelText: '重新开始',
          confirmText: '复活',
          success: (res) => {
            if (res.confirm) {
              wx.showModal({
                title: '假装观看视频',
                content: '视频。视频。视频',
                showCancel: false,
                success: (res) => {
                  this.setData({
                    list: []
                  });
                  setTimeout(() => {
                    this.animateStart();

                  }, 500);
                }
              })
            } else if (res.cancel) {
              this.setData({
                pass: 1,
                goal: 1000,
                score: 0,
                list: []
              })
              setTimeout(() => {
                this.animateStart();

              }, 500);
            }
          }
        })
      } else {
        wx.showToast({
          title: '恭喜通关',
          icon: 'none',
          duration: 2000,
          complete: () => {
            this.next();
          }
        })
      }
    }
  },
  next() {
    let pass = this.data.pass + 1;
    this.setData({
      pass: pass,
      goal: this.data.goal + 1500,
      score: 0,
      list: []
    })
    setTimeout(() => {
      this.animateStart();
    }, 500);
  },
  //判断是否有column需要左移
  moveLeft() {
    for (let x = this.data.list.length - 1; x >= 0; x--) {
      const columns = this.data.list[x];
      if (!columns.length) {
        this.data.list.splice(x, 1);
      }
    }
    this.setData({
      list: this.data.list
    })
  },
  //随机初始化元素
  init() {
    this.setData({
      list: []
    })
    for (let x = 0; x < this.data.column; x++) {
      this.data.list[x] = [];
      for (let y = 0; y < this.data.row; y++) {
        const num = parseInt(Math.random() * this.data.category.length);
        this.data.list[x].push({ type: this.data.category[num], shake: false });
      }
    }
    setTimeout(() => {
      this.setData({
        list: this.data.list
      })
    }, 500);
  }
});
