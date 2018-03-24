import * as sinon from 'sinon';
import { expect } from 'chai';
import { ClientProxy } from '../../client/client-proxy';
import { Observable } from 'rxjs';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

class TestClientProxy extends ClientProxy {
  public publish(pattern, callback) {}
}

describe('ClientProxy', () => {
  const client = new TestClientProxy();

  describe('send', () => {
    it(`should return an observable stream`, () => {
      const stream$ = client.send({}, '');
      expect(stream$ instanceof Observable).to.be.true;
    });
    it(`should call "publish" on subscribe`, () => {
      const pattern = { test: 3 };
      const data = 'test';
      const publishSpy = sinon.spy();
      const stream$ = client.send(pattern, data);
      client.publish = publishSpy;

      stream$.subscribe();
      expect(publishSpy.calledOnce).to.be.true;
    });
    it('should return ErrorObservable', () => {
      const err$ = client.send(null, null);
      expect(err$).to.be.instanceOf(ErrorObservable);
    });
  });

  describe('createObserver', () => {
    it(`should return function`, () => {
      expect(typeof client['createObserver'](null)).to.be.eql('function');
    });

    describe('returned function calls', () => {
      let fn;
      const error = sinon.spy(),
        next = sinon.spy(),
        complete = sinon.spy(),
        observer = {
          error,
          next,
          complete,
        };

      before(() => {
        fn = client['createObserver'](observer);
      });

      it(`"error" when first parameter is not null or undefined`, () => {
        const err = 'test';
        fn({ err });
        expect(error.calledWith(err)).to.be.true;
      });

      it(`"next" when first parameter is null or undefined`, () => {
        const data = 'test';
        fn({ response: data });
        expect(next.calledWith(data)).to.be.true;
      });

      it(`"complete" when third parameter is true`, () => {
        const data = 'test';
        fn({ data, isDisposed: true });
        expect(complete.called).to.be.true;
      });
    });
  });
});